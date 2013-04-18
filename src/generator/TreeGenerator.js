/*
   stub
  
   Given: A representative "full" tree of the form in content-maps/wordpress.json

   Auto-generate many trees representing the situation in which things are and
   aren't there.


   For each "node" in the tree.
     - If the node is an array:
       - recurse with versions:
          - empty array (no recursion)
          - one element arraay
          - two element array
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
    posts: {"A", "B"}
  }

  want to emit:

  {}
  // Case w/ or w/o title
  blog: {
    title: Foo
  }
  blog: {}
  blog: 

