<template>
    <div class="pdfContent">
      <div id="viewArea" class="content" ref="box" @scroll="handleScroll($event)">
        <div id="canvasDiv" ref="canvasDiv"></div>
      </div>
      <div class="controlBar fix tc">
        <span>当前第{{pageNum}}页</span>
        <span>共{{pdfDoc.numPages}}页</span>
      </div>
    </div>
  </template>
  <script>
    const PDFJS = require('pdfjs-dist');
    PDFJS.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');
    PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    export default {
      name: 'pdf1',
      data() {
        return{
          pdfDoc:{
            numPages:0
          },
          pageNum: 1,
          pageRendering: false,
          pageNumPending: null,
          scale:1.5,
          loading:false,
          viewHeight:0,
          canvasHeight:0,
          curScrollTop:0,
          maxScrollHeight:0,
        }
      },
      props: ['src'],
      watch:{
        src(newVal){
          this.showPDF(newVal)
        }
      },
      methods: {
        showPDF(url) {
          let _this = this;
          _this.loading = true;
          PDFJS.getDocument(url).promise.then(function(pdf) {
            _this.pdfDoc = pdf;
            _this.pageNum = 1;
            _this.renderPage(_this.pageNum);
          });
   
        },
        renderPage(num) {
          let _this = this;
          _this.pageRendering = true;
          _this.pdfDoc.getPage(num).then(function(page) {
            console.log('------------In-----------')
            let canvasDiv = document.getElementById('canvasDiv');
            let canvas = document.createElement("canvas");
            if(num === 1){
              canvasDiv.innerHTML = '';
              _this.$refs.canvasDiv.scroll(0,0);
              _this.curScrollTop = 0;
            }
            canvas.id = "canvas_" + num;
            canvasDiv.appendChild(canvas)
            let ctx = canvas.getContext('2d');
            let dpr = window.devicePixelRatio || 1;//设备像素比
            let bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;//浏览器在渲染canvas之前会用几个像素来来存储画布信息,类似img
            let ratio = dpr / bsr;
   
            // let viewport = page.getViewport(920 / page.getViewport(_this.scale).width); //用户网页的可视区域
            let viewport = page.getViewport({ scale: _this.scale});
            console.log(viewport);
            console.log(viewport.width);
            console.log(ratio);
            canvas.height = viewport.height * ratio;
            canvas.width = viewport.width * ratio;
   
            // canvas.style.width = viewport.width + 'px';//画布的框架大小
            // canvas.style.width = 600 + 'px';//画布的框架大小
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
   
            // Render PDF page into canvas context
            var renderContext = {
              canvasContext: canvas.getContext("2d"),
              viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function() {
              _this.pageRendering = false;
              if (_this.pageNumPending !== null) {
                _this.renderPage(_this.pageNumPending);
                _this.pageNumPending = null;
              }
              _this.loading = false;
            });
              _this.canvasHeight = canvas.height;
              _this.maxScrollHeight = canvasDiv.offsetHeight
              // canvasDiv.width = canvas.width;
   
          });
        },
        queueRenderPage(num) {
          if (this.pageRendering) {
            this.pageNumPending = num;
          } else {
            this.renderPage(num);
          }
        },
        handleScroll(e){
          this.curScrollTop = e.target.scrollTop;
          // debugger
          if(this.curScrollTop >= this.canvasHeight*this.pageNum-this.viewHeight){
            if(this.curScrollTop + this.viewHeight >= this.maxScrollHeight-this.canvasHeight) {
              if (this.pageNum >= this.pdfDoc.numPages) {
                return;
              }
              debugger
              this.pageNum++;
              this.queueRenderPage(this.pageNum);
              console.log("queueRenderPage" + this.pageNum);
            }else{
              this.pageNum = parseInt((this.curScrollTop + this.viewHeight)/this.canvasHeight)+1
            }
          }else if(this.curScrollTop<this.canvasHeight*(this.pageNum-1)-this.viewHeight){
            if (this.pageNum <= 1) {
              return;
            }
            this.pageNum--;
          }
        }
      },
      async created() {
        this.showPDF(this.src);
      },
      mounted(){
        let viewArea = document.getElementById('viewArea')
        this.viewHeight = viewArea.offsetHeight;
      }
    }
  </script>
  <style scoped>
    .pdfContent{ width:100%; height:100%;}
    .pdfContent .content { overflow:auto; height:60vh; overflow-x:hidden; overflow-y:auto;}
    .controlBar { padding-top:20px;}
    .controlBar span{ margin-right:20px;}
    #canvasDiv canvas{margin:0;padding:0;height:auto;}
  </style>