function loadScript() {
  import("./gs-worker.js");
}

var Module;
const ps_args = [
  "-sDEVICE=pdfwrite",
  "-dCompatibilityLevel=1.4",
  "-dPDFSETTINGS=/ebook",
  "-DNOPAUSE",
  "-dQUIET",
  "-dBATCH",
  "-sOutputFile=out.pdf",
  "in.pdf",
];

function ps_2_pdf(
  data,
  cb_response,
) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", data.ps_url);
  xhr.responseType = "arraybuffer";
  xhr.onload = () => {
    self.URL.revokeObjectURL(data.ps_url);
    Module = {
      preRun: [
        function () {
          self.Module.FS.writeFile("in.pdf", new Uint8Array(xhr.response));
        },
      ],
      postRun: [
        function () {
          let arr = self.Module.FS.readFile("out.pdf", { encoding: "binary" });
          let blob = new Blob([arr], { type: "application/octet-stream" });
          let pdf_url = self.URL.createObjectURL(blob);
          cb_response({ pdf_url: pdf_url, url: data.url });
        },
      ],
      arguments: ps_args,
      print: function (text) {},
      printErr: function (text) {},
      totalDependencies: 0,
      noExitRuntime: 1
    };
    if (!self.Module) {
      self.Module = Module;
      loadScript();
    } else {
      self.Module["calledRun"] = false;
      self.Module["postRun"] = Module.postRun;
      self.Module["preRun"] = Module.preRun;
      self.Module.callMain();
    }
  };
  xhr.send();
}


self.addEventListener('message', function({data:e}) {
  if (e.target !== 'wasm') return;
  ps_2_pdf(e.data, ({ pdf_url }) => self.postMessage(pdf_url))
});
