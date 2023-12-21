const JSXGetURL = function () {
  var cepFolder = File($.fileName).parent;
  var scriptFolder = File(cepFolder.fsName + '/lib/JSXGetURL');

  var isWin = File.fs == 'Windows';
  var fileNameExtension = isWin ? '.dll' : '.framework';
  var x64Suffix = '_x64';
  var libFileName = 'JSXGetURL';

  var lib64Filename = libFileName + x64Suffix + 'R' + fileNameExtension;

  var libPath64;
  if (isWin) {
    libPath64 = scriptFolder.fsName + '/win64/' + lib64Filename;
  } else {
    libPath64 = scriptFolder.fsName + '/osx10_64/' + lib64Filename;
  }

  function tryLib(libPath) {
    var file = new File(libPath);
    var lib = undefined;
    if (file.exists) {
      try {
        lib = new ExternalObject('lib:' + file.fsName);
      } catch (err) {
      }
    }
    return lib;
  }

  // Use previously loaded lib, if any
  lib = tryLib(libPath64);
  JSXGetURL.lib = lib;
  lib.disable(false);

  return lib;
};
