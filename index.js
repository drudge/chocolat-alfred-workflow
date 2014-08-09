var path = require('path');
var alfredo = require('alfredo');

var PROJECTS_FILE = path.join(
  process.env.HOME,
  'Library',
  'Application Support',
  'Chocolat',
  'recent_projects.plist'
);

var getResults = exports.getResults = function(arg) {
  var projects = alfredo.readPlistSync(PROJECTS_FILE) || [];
  var results = [];
  
  results = results.map(function(project) {
    project.directoryPath = decodeURIComponent(project.directoryPath);
    return project;
  });
  
  if (!arg) {
    results = projects.sort(function(a, b) {
      return b.lastOpened - a.lastOpened;
    });
  } else {
    return alfredo.fuzzy(arg, projects.map(function(project) {
      return project.directoryPath;
    })).map(function(name) {
      return projects.filter(function(project) {
        return project.directoryPath === name;
      }).pop();
    });
  }
  
  return results || [];
};

var getItems = exports.getItems = function(arg) {
  return getResults(arg).map(function(project) {
    return new alfredo.Item({
      title: path.basename(project.directoryPath),
      subtitle: project.directoryPath,
      arg: project.directoryPath
    });
  });
};

if (!require.parent) {
  var args = process.argv;
  var items = getItems(args.length >= 3 ? args[2] : undefined);
  alfredo.feedback(items);
}