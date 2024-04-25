<template>
  <div id="container"></div>
</template>
<script>
  const PDFJS = require('pdfjs-dist');
  PDFJS.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');
  PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  export default {
    name: 'pdf3',
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
        PDFJS.getDocument(url)
              .promise.then(function(pdf) {
              
                // Get div#container and cache it for later use
                var container = document.getElementById("container");
              
                // Loop from 1 to total_number_of_pages in PDF document
                for (var i = 1; i <= pdf.numPages; i++) {
                
                    // Get desired page
                    pdf.getPage(i).then(function(page) {
                    
                      const scale = 1.5; 
                      const outputScale = window.devicePixelRatio || 1;
                      const viewport = page.getViewport({scale});
                      const div = document.createElement("div");
                    
                      // Set id attribute with page-#{pdf_page_number} format
                      div.setAttribute("id", "page-" + i);
                    
                      // This will keep positions of child elements as per our needs
                      div.setAttribute("style", "position: relative");
                    
                      // Append div within div#container
                      container.appendChild(div);
                    
                      // Create a new Canvas element
                      const canvas = document.createElement("canvas");
                    
                      // Append Canvas within div#page-#{pdf_page_number}
                      div.appendChild(canvas);
                    
                      const context = canvas.getContext('2d');
                      canvas.width = Math.floor(viewport.width * outputScale);
                      canvas.height = Math.floor(viewport.height * outputScale);
                      canvas.style.width = Math.floor(viewport.width) + "px";
                      canvas.style.height = Math.floor(viewport.height) + "px";
                      // canvas.height = viewport.height;
                      // canvas.width = viewport.width;
                    
                      const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                      };
                    
                      // Render PDF page
                      page.render(renderContext);
                    });
                }
              });
 
      },
    
    },
    async created() {
      this.showPDF(this.src);
    },
  
  }
</script>