var path = require('path');
var alp = require('alp');
var fuzzy = require('fuzzy-filter');

var PROJECTS_FILE = process.env.HOME + '/Library/Application Support/Chocolat/recent_projects.plist';

exports.getResults = function(arg) {
  var projects = alp.readPlistSync(PROJECTS_FILE) || [];
  var results = [];
  
  if (!arg) {
    results = projects.sort(function(a, b) {
      return b.lastOpened - a.lastOpened;
    });
  } else {
    return fuzzy(arg, projects.map(function(project) {
      return project.directoryPath;
    })).map(function(name) {
      return projects.filter(function(project) {
        return project.directoryPath === name;
      }).pop();
    });
  }
  
  return results || [];
};

exports.getItems = function(arg) {
  var items = [];
  
  exports.getResults(arg).forEach(function(project) {
    items.push(new alp.Item({
      title: path.basename(project.directoryPath),
      subtitle: project.directoryPath,
      arg: project.directoryPath
    }));
  });
  
  return items;
};

if (!require.parent) {
  var args = process.argv;
  var items = exports.getItems(args.length >= 3 ? args[2] : undefined);
  alp.feedback(items);
}