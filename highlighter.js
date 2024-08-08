var available_versions = [1, 2];
var default_ver = getDefaultVersion();
var docs_path = '/docs/v';

docReady(function() {
  var pres = document.querySelectorAll('code.lang-autohotkey');
  if (!pres.length)
    return;
  for (var i = 0; i < available_versions.length; i++)
    window['pres' + available_versions[i]] = [];
  for (var i = 0; i < pres.length; i++)
  {
    var pre = pres[i];
    pre.ver = identifyByRequires(pre.innerText);
    pre.originalContent = pre.innerHTML;
    if (available_versions.indexOf(pre.ver) == -1)
      pre.ver = default_ver;
    window['pres' + pre.ver].push(pre);
    addToolToggleVersion(pre);
  }
  for (var i = 0; i < available_versions.length; i++)
  {
    var ver = available_versions[i];
    addSyntaxColors(window['pres' + ver], ver);
  }
});

function addSyntaxColors(pres, ver)
{
  if (!retrieveCtor(docs_path + ver + '/static/highlighter/highlighter.js', 'ctor_highlighter', 'highlighter' + ver, function() {addSyntaxColors(pres, ver);}))
    return;
  if (!retrieveData(docs_path + ver + '/static/source/data_index.js', 'indexData', 'index' + ver, function() {addSyntaxColors(pres, ver);}))
    return;
  window['highlighter' + ver].addSyntaxColors(pres, window['index' + ver], docs_path + ver + '/');
}

function loadScript(url, callback)
{
  var script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState)
  {  // IE
    script.onreadystatechange = function()
    {
      if (script.readyState == "loaded" || script.readyState == "complete")
      {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else
  { // Others
    script.onload = function()
    {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

function retrieveData(path, sourceVarName, targetVarName, callback) {
  if (!window[targetVarName]) {
    loadScript(path, function() {
      window[targetVarName] = window[sourceVarName];
      callback();
    });
    return false;
  }
  return true;
}

function retrieveCtor(path, sourceConstName, targetVarName, callback) {
  if (!window[targetVarName]) {
    loadScript(path, function() {
      window[targetVarName] = new window[sourceConstName]();
      callback();
    });
    return false;
  }
  return true;
}

function docReady(fn)
{
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive")
  {
    // call on next available tick
    setTimeout(fn, 1);
  } else
  {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function identifyByRequires(syntax)
{
  var regex = /^[ \t]*#Requires[ \t]+AutoHotkey[ \t]+.*?(.*?)(?=[ \t]+?;.*?|[ \t]*?$)/im;
  if (m = syntax.match(regex))
  {
    var items = m[1].split(/ |\t/);
    for (i = 0; i < items.length; i++)
    {
      var item = items[i];
      if (!item.match(/\d+-bit/i) && (m = item.match(/(?:<|<=|>|>=|=)?v?(\d+)/i)))
        return parseInt(m[1]);
    }
  }
  return null;
}

function getDefaultVersion()
{
  var forum_ids = [
    [76, 18, 6, 19, 7, 74],       // v1
    [82, 94, 83, 95, 96, 92, 37]  // v2
  ];
  var forum_id = null;
  if (m = location.href.match(/f=(\d+)/))
    forum_id = parseInt(m[1]);
  else // ID is not always present in the URL
  {
    var h2_a = document.querySelector('h2 a');
    if ((h2_a) && (m = h2_a.href.match(/f=(\d+)/)))
      forum_id = parseInt(m[1]);
  }
  if (forum_id)
    for (var i = 0; i < available_versions.length; i++)
      if (forum_ids[i].indexOf(forum_id) != -1)
        return i + 1;
  return available_versions[available_versions.length - 1];
}

function addToolToggleVersion(pre)
{
  var tb = pre.parentNode.previousSibling;
  var toggleVersion = document.createElement('a');
  toggleVersion.href = '#';
  var next_ver = getNextVersion(pre.ver);
  toggleVersion.innerHTML = 'Toggle version (' + pre.ver + ' → ' + next_ver + ')';
  toggleVersion.setAttribute('onclick', 'toggleVersion(this); return false;');
  tb.innerHTML += ' - ' + toggleVersion.outerHTML;
}

function toggleVersion(toggleVersion)
{
  var pre = toggleVersion.parentNode.parentNode.querySelector('code.lang-autohotkey');
  var next_ver = getNextVersion(pre.ver);
  var next_next_ver = getNextVersion(next_ver);
  toggleVersion.innerHTML = 'Toggle version (' + next_ver + ' → ' + next_next_ver + ')';
  pre.innerHTML = pre.originalContent;
  addSyntaxColors([pre], next_ver);
  pre.ver = next_ver;
}

function getNextVersion(ver)
{
  var index = available_versions.indexOf(ver);
  return index != -1 ? available_versions[(index + 1) % available_versions.length] : null;
}
