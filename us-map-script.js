<script type="module">
// allow for any svg with id'd paths to be clickable - mapped ids to links
// allow for image upload 
// allow for image paths to be displayed
// each image path will have configurable options
  // hover effect / color
  // link
  // link target
  // label    
  // export the relationships to a json file that is automatically linked
// allow for image paths to be marked as unclickable
// allow for new paths to be added as clickable areas without changing the svg   
// Initially built for this map::: ./us-states.svg 

const clickListener = function(evt) {
  console.log('you clicked on: ', evt.target.id);
};

const mapPathClick = function() {
  const paths = document.querySelectorAll('svg path');
  paths.forEach(path => {
    path.addEventListener('click', (evt) => {

      clickListener(evt);
    });
  });
};
</script>