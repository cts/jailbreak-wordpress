Jailbreak.Generator.TreeGenerator = function() {

};

Jailbreak.Generator.TreeGenerator.prototype.generateTrees = function(fullTree, emitFn) {
  var allTrees = this.spawnTrees(fullTree, []);
  for (var i = 0; i < allTrees.length; i++) {
    emitFn(allTrees[i]);
  }

};
Jailbreak.Generator.TreeGenerator.prototype.spawnTrees = function(baseTree, pointerIntoTree, noRecursion) {
  var stopRecursion = noRecursion ? noRecursion : false;
  var trees = [];
  var node = baseTree;
  if (baseTree === 'undefined' || pointerIntoTree === 'undefined') {
    return [];
  }
  if (pointerIntoTree === null) {
    return [baseTree];
  }
  for (var x = 0; x < pointerIntoTree.length; x++) {
    node = node[pointerIntoTree[x]];
  }

  trees.push(baseTree);


  if (node == null || typeof node === "undefined" || (Node instanceof Array && Node.length == 0)) {
    trees.push(baseTree);

  } else if (typeof node === 'number' || typeof node === 'string') {
    trees.push(baseTree);
    if (!stopRecursion) {
      var copy = jQuery.extend(true, {}, baseTree);
      this.removeFromTree(copy, pointerIntoTree);
      trees = trees.concat(this.spawnTrees(copy, pointerIntoTree));
    }
  } else if (node instanceof Array) {
    var treeCopy = jQuery.extend(true, {}, baseTree);
    var nodeCopy = treeCopy;
    for (var f = 0; f < pointerIntoTree.length; f++) {
      nodeCopy = nodeCopy[pointerIntoTree[f]];
    }
    var treeCopy2 = jQuery.extend(true, {}, baseTree);
    var nodeCopy2 = treeCopy2;
    for (var z = 0; z < pointerIntoTree.length; z++) {
      nodeCopy2 = nodeCopy2[pointerIntoTree[z]];
    }
    var treeCopy3 = jQuery.extend(true, {}, baseTree);
    var nodeCopy3 = treeCopy3;
    for (var w = 0; w < pointerIntoTree.length; w++) {
      nodeCopy3 = nodeCopy3[pointerIntoTree[w]];
    }
    // using all values of the array
    for (var x = 0; x < node.length; x++) {
      var newPath = pointerIntoTree.slice(0);
      newPath.push(x);
      trees = trees.concat(this.spawnTrees(treeCopy, newPath, true));
    }
    var length = nodeCopy2.length - 1;
    for (var g = length; g > 0; g--) {
      nodeCopy2.splice(g, 1);
    }
    var path2 = pointerIntoTree.slice(0);
    path2.push(0);
    trees = trees.concat(this.spawnTrees(treeCopy2, path2));

  } else if (typeof node === 'object' && _.keys(node).length > 0) {
    for (var i = 0; i < _.keys(node).length; i++) {
      var key = _.keys(node)[i];
      var tree2 = jQuery.extend(true, {}, baseTree);

      var newPath = pointerIntoTree.slice(0);
      newPath.push(key);
      trees = trees.concat(this.spawnTrees(baseTree, newPath));
      this.removeFromTree(tree2, newPath);
      trees = trees.concat(this.spawnTrees(tree2, pointerIntoTree.slice(0, pointerIntoTree.length - 1)));
      trees = trees.concat(this.spawnTrees(baseTree, newPath));
    }
  }
  return this.removeDuplicates(trees);
};

Jailbreak.Generator.TreeGenerator.prototype.removeDuplicates = function(treeList) {
  for (var i = 0; i < treeList.length; i++) {
    for (var j = 0; j < i; j++) {
      if (j !== i && _.isEqual(treeList[i], treeList[j])) {
        var newList = treeList.slice(0, j).concat(treeList.slice(j + 1, treeList.length));
        return this.removeDuplicates(newList);
      }
    }
  }
  return treeList
};


Jailbreak.Generator.TreeGenerator.prototype.removeFromTree = function(tree, path) {
  var node = tree;
  for (var i = 0; i < path.length - 1; i++) {
    node = node[path[i]];
  }
  var last = path[path.length - 1]
  // console.log('Type: ' + typeof(last));
  if (node instanceof Array) {
    //console.log("node before: " + node + "tree: " + JSON.stringify(tree));
    node.splice(last, 1);
    //  console.log("node after: " + node + "tree: " + JSON.stringify(tree));

    return;
  } else {
    delete node[path[path.length - 1]];
  }
};

/*
   stub
  
   Given: A representative "full" tree of the form in content-maps/wordpress.json

   Auto-generate many trees representing the situation in which things are and
   aren't there.


   For each "node" in the tree.
     - If the node is an array:
       - recurse with versions:
          - empty array (no recursion) (nonexistant)
          - one element arraay
          - all element array
    - If the node is a primitive:
      - recurse with versions with it there, and with it not there
    - If the node is an object (dict)
      - recurse with versions with it there and with it not there

  spawnTrees(baseTree, pointerIntoTree, emitFn) {
    if pointerToTree is {array or primitive or string}
      for each case we want to condier
        newTree = createNewTreeForThisCaseWithModifications
        spwanTrees(newTree, newPointerYouBumptedInto, emitFn)
    else if pointerIntoTree is null (you hit a leaf or something)
      emitFn(tree)

  blog: {
    title: Foo
    posts: ["A", "B"]
  }

  want to emit:

  {}
   blog: {
    title: Foo
    posts: ["A", "B"]
  }
  // Case w/ or w/o title
  blog: {
    title: Foo
  }

  blog: {posts:[A]}
  blog: {posts:[A,B]}
  blog: {title:foo,posts:[A]}
  blog: {title: foo, posts:[A,B]}
  
  if have empty object, list, or null string just remove the key

*/
