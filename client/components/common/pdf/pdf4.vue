<template>
  <div id="pdfContainer" ref="pdfDiv" style="height:600px;overflow-y:scroll">
    <div/>
  </div>
</template>
 
<script>
const pdfJS = require("pdfjs-dist");
const pdfViewer = require("pdfjs-dist/web/pdf_viewer")
pdfJS.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");

// const pdfJS = require("pdfjs-dist/legacy/build/pdf.mjs");
// const pdfViewer = require("pdfjs-dist/legacy/web/pdf_viewer.mjs");
// pdfJS.GlobalWorkerOptions.workerSrc = "../../../../node_modules/pdfjs-dist/build/pdf.worker.mjs";

export default {
  name: 'pdf',
  props: {
    src: String
  },
  mounted() {
    this.renderPage(this.src);
  },
  data() {
    return {
      pageNo: null,
      pdfPageNumber: null,
      renderingPage: false,
      pdfDoc: null, 
      scale: 1, // 缩放值
      width: "",
      height: "",
    };
  },
  // async created() {
  //       this.renderPage();
  // },
  methods: {
    
    loadPdf(url) {
      let _this = this;
      pdfJS.getDocument(url).promise.then(function(pdf) {
            _this.pdfDoc = pdf;
            _this.pdfPageNumber = pdf.numPages;
            _this.renderPage();
          });
    },
 
    // 根据页码渲染相应的PDF
    renderPage(url) {
      // const container = document.getElementById("pdfContainer");
      const container = this.$refs.pdfDiv;
      // 禁用右键菜单
      container.oncontextmenu = (e) => {e.preventDefault();}
      const eventBus = new pdfViewer.EventBus();
          
      // (Optionally) enable hyperlinks within PDF files.
      const pdfLinkService = new pdfViewer.PDFLinkService({
        eventBus,
      });
      
      // (Optionally) enable find controller.
      const pdfFindController = new pdfViewer.PDFFindController({
        eventBus,
        linkService: pdfLinkService,
      });
      
      // (Optionally) enable scripting support.
      // const pdfScriptingManager = new pdfViewer.PDFScriptingManager({
      //   eventBus,
      //   sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
      // });
      
      let pdfView = new pdfViewer.PDFViewer({
        container,
        eventBus,
        linkService: pdfLinkService,
        findController: pdfFindController,
        textLayerMode: 0,
        // removePageBorders: true,
        renderInteractiveForms: true,
        enablePrintAutoRotate: true,
        enableWebGL: true,
        // scriptingManager: pdfScriptingManager,
      });
      // let pdfView = new pdfViewer.PDFViewer({container, eventBus});

      pdfLinkService.setViewer(pdfView);
      // pdfScriptingManager.setViewer(pdfView);
      
      eventBus.on("pagesinit", function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        // pdfView.currentScaleValue = 1;
        pdfView.currentScaleValue = "page-width";
      
        // We can try searching for things.
        // if (SEARCH_FOR) {
        //   eventBus.dispatch("find", { type: "", query: SEARCH_FOR });
        // }
      });
      eventBus.on("pagemode", {
          source: this,
          mode: "thumbs"
        });
      // Loading document.
      pdfJS.getDocument(url).promise.then(function(pdf) {
          pdfView.setDocument(pdf);
          pdfLinkService.setDocument(pdf, null);
      });
      // const loadingTask = pdfJS.getDocument({
      //   url: this.src,
      // });
      
      // const pdfDocument = await loadingTask.promise;
      // // Document loaded, specifying document for the viewer and
      // // the (optional) linkService.
      // pdfViewer.setDocument(pdfDocument);

      // pdfLinkService.setDocument(pdfDocument, null);
    },
      

  },
};
</script>
<style scoped>
    
    #pdfContainer {margin-top: 50px; padding:0; }
  
</style>