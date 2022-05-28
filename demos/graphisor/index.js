import {showForm} from "./form.js";
import formSchemaGraph from "./form-schema-graph.js";
import formSchemaNode from "./form-schema-node.js";
import formSchemaGroup from "./form-schema-group.js";
import formSchemaEdge from "./form-schema-edge.js";
import formSchemaFilter from "./form-schema-filter.js";
import style from "./style.js";
import jstest from "./readfile.js";
import NodeMapping from "./NodeMapping.js";
import EdgeMapping from "./EdgeMapping.js";
import GraphModel from "./data/GraphModel.js";

const { MozelSyncClient } = window.Graph;

const LAYOUTS = {
	cose: {
		name: 'cose',
		idealEdgeLength: () => 100,
		nodeDimensionsIncludeLabels: true
	}
};

var settings;
var showHelp = false;

function fileread(input){

	let file = input.files[0];
	fetchFile(file.name);
	};   


            
const cy = window.cy = cytoscape({
        container: document.getElementById('graph'),
        style: style,	 
  
});

// Create an empty model with just the root element
const model = GraphModel.create({gid: 'root'});

// Setup two-way node and edge mapping between model and cytoscape
const nodeMapping = new NodeMapping(cy, model, model.nodes);
const edgeMapping = new EdgeMapping(cy, model, model.edges);

// Loading initial set of nodes: watch the nodes, wait for all nodes to be added, then zoom to fit.
const watcher = model.$watch('nodes.*', _.debounce(() => { // debounce to wait until last node is added
	model.$removeWatcher(watcher); // only once
	cy.fit();
}, 100));

// Watch for changes in layout to update UI
model.$watch('layout', ({newValue}) => {
	// This will only change displayed value in the dropdown; to actually apply a layout, `applyLayout` must be called
	document.querySelector('.layout-name').innerHTML = newValue;
});

// Setup online session
const session = window.location.hash.substring(1); // Get everything after the hashtag (#) in the url
const client = new MozelSyncClient(model, "188.166.57.139:3000", session);
//const client = new MozelSyncClient(model, "localhost:3000", session);
//const client = new MozelSyncClient(model, "213.93.202.18:3000", session);

// When cytoscape is ready, start loading the data
//fetchFile('data.json');

function fetchFile(filename){
cy.ready(async function() {
	
	nodeMapping.start();
	edgeMapping.start();

	if(!session.length) {		
		// If we started the session, load the initial graph data
		
		const response = await fetch('data/'+filename); // can be from anywhere
		const data2 = await response.json();
		console.log(data2);
 	   console.log(data2.nodes);
 	   cy.data('title', data2.title);
 	   cy.data('layout', data2.layout);
 	   cy.data('background', data2.background);
 	   
 	   model.title=data2.title;
 	   model.background=data2.background;
 	   
      cy.data('background', data2.background);
      cy.data('layout', data2.layout);
		for(let node of data2.nodes) {
			if (typeof node['label'] !== "undefined"){
			  		
			  //node.title = node.data['title'];
  			  console.log(node.title); 

			  console.log(node); 
			  model.nodes.add(node);    
			  console.log(model.nodes);      	
			}
	  }
     console.log(model.nodes);
	  console.log(data2.edges);
	  if (typeof data2.edges !== 'undefined'){
	   for(let edge of data2.edges) {
	   	 console.log(edge);
	       model.edges.add(edge);	
	  	}
     }
    

	//	model.$setData(data);
		console.log(model.nodes);
		applyLayout('cose');
	}

	// Start online session
	await client.start();

	// If url did not have a hashtag yet, it will now set it to the session ID.
	// URL can be shared with others to let them join.
	window.location.hash = '#' + client.session;
});
}

function fetchFile2(filename){
cy.ready(async function() {
//function fetchFile2(filename){  
//return fetch('./data/'+ filename).then(async response => {	
	
	var collection= cy.elements();
	cy.remove(collection);
	nodeMapping.start();
	edgeMapping.start();

	if(!session.length) {		
		// If we started the session, load the initial graph data
		
		const response = await fetch('data/'+filename); // can be from anywhere
		const data2 = await response.json();
		console.log(data2);
      cy.data('title', data2.data.title);
      cy.data('background', data2.data.background);
      cy.data('layout', data2.data.layout);
 	   model.title=data2.data.title;
 	   model.background=data2.data.background;
 	   model.layout=data2.data.layout;
		if (typeof data2.elements.nodes !== 'undefined'){
   
		for(let node of data2.elements.nodes) {
			if (typeof node.data['label'] !== 'undefined'){	
			 console.log(node.data['label']);
			  node.data['gid']=node.data['id'];
			  console.log(node);
			  node.label=node.data['label'];
			  node.title=node.data['title'];
			  node.description=node.data['description'];
			  model.nodes.add(node);
			  console.log(model.nodes);
           	
			}else{
			  console.log("No label: " + node.data['id']);			
			}
			if (node.data['label'] == "Group"){
				var group=[];			
				group.id = node.data['id'];
				group.name = node.data['title'];
      //      groupNodes.push(group);	
			}
   	}
    }
  
   if (typeof data2.elements.edges !== 'undefined'){
	   for(let edge of data2.elements.edges) {
	   	 
	   	 console.log(edge);
	   	
          var presets={};
          edge.data['gid']=edge.data['id'];
          presets.id=edge.data['id'];
          //presets.gid=edge.data['id'];
          presets.source={};
          presets.target={} 	   	 
	   	 presets._type="edge"; 
	     	 presets.label = edge.data['label'];	       
	     	 presets.source.gid = edge.data['source'];
	     	 presets.target.gid=edge.data['target'];
	     	
      	 const edge1=model.edges.add(edge);
	       //const edge1 = edgeMapping.getModelByGid(edge.data['gid']);
	     	 console.log(edge1);
	     	 console.log(edge1.gid);
          presets.gid=edge1.gid;
          presets.id=edge1.gid;
          console.log(presets);
  //    	 cy.add(edge);
	     	// createEdge(presets);
       	 updateEdge(presets);
       	 
//	     	 createEdge(presets);
	     	 //edge = edgeMapping.setRelation(edge, edge.source.gid,edge.target.gid);
	     	 
//      var edge2 = model.edges.add(edge1);
//      
	       //const edge3 = edgeMapping.getModelByGid(edge1.gid);
	       //edge2.$setData(edge1);
	       
	       //edge1.set('source',edge.data['source']);
	       //edge1.set('target',edge.data['target']);
	       //edge.$setSource(data);
	      //onsole.log (edge2);
	       console.log(model.edges);
		}
   }
   cy.data('groups', groupNodes());
   var groups=groupNodes();  
	applyLayout(cy.data('layout'));
	loadBackGround(cy.data('background'));
	displayContents('gtitle', cy.data('title'));
	}

	// Start online session
	await client.start();

	// If url did not have a hashtag yet, it will now set it to the session ID.
	// URL can be shared with others to let them join.
	window.location.hash = '#' + client.session;
});
 // return data2;
}
//).catch(e => console.error(e));
//}



function fetchFile3(filename){  
return fetch('./data/'+ filename).then(async response => {
//async function onSubmit() {	
   var collection= cy.elements();
	cy.remove(collection);
 	const data2 = await response.json();
// 	const data = await response.json();
//	model.$setData(data);

 	console.log(data2);
// 	console.log(model);
 	//console.log(data2.data.background);
   //console.log(data2.data.title); 
   cy.data('title', data2.data.title);
   cy.data('background', data2.data.background);
   cy.data('layout', data2.data.layout);
   if (typeof data2.elements.nodes !== 'undefined'){
   //	groupNodes=[];
		for(let node of data2.elements.nodes) {
//   for(let nodes of data) {
			if (node['classes'] !== "eh-handle"){	
			  node.data['gid']=node.data['id'];
			  console.log(node);
			  model.nodes.add(node);
			  console.log(model.nodes);
           cy.add(node);		
			}
			if (node.data['label'] == "Group"){
				var group=[];
				
				group.id = node.data['id'];
				group.name = node.data['title'];
      //      groupNodes.push(group);	
			}
   	}
   }
  
   if (typeof data2.elements.edges !== 'undefined'){
	   for(let edge of data2.elements.edges) {
	
	       cy.add(edge);		
	       model.edges.add(edge);
	
		}
   }
   cy.data('groups', groupNodes());
   var groups=groupNodes();  
	applyLayout(cy.data('layout'));
	applyLayout('cose');
	
	loadBackGround(cy.data('background'));
	displayContents('gtitle', cy.data('title'));
	return data2;
}
).catch(e => console.error(e));
}


				
cy.contextMenus({
	menuItems: [{
		id: 'edit',
		content: 'Edit',
		show: true,
		selector: '.entity',
		onClickFunction: event => {
			if(event.target.isNode()) {
				console.log(event.target);
				const node = nodeMapping.getModel(event.target)
				console.log(node);
				if(!node) throw new Error(`Node is not editable.`);
				showNodeForm(node.$export());
			}
			if(event.target.isEdge()) {
				const edge = edgeMapping.getModel(event.target)
				if(!edge) throw new Error(`Edge is not editable.`);
				showEdgeForm(edge.$export());
			}
		}
	},{
		id: 'remove',
		content: 'Remove',
		show: true,
		selector: '.entity',
		onClickFunction: event => {
			event.target.remove();
		}
	}, {
		id: 'addNode',
		content: 'Create node',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			showNodeForm({x: event.position.x, y: event.position.y, gn:groupNodes() });
		}
	},	
	{
		id: 'addGroup',
		content: 'Create group',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			showGroupForm({x: event.position.x, y: event.position.y, gn:groupNodes() });
		}
		
	},	
	{
		id: 'unlockNode',
		content: 'Unlock node',
		show: true,
		selector: '.entity',
		onClickFunction: event => {
			if(event.target.isNode()) unlockNode(event.target);
		}
	},	
		{
		id: 'downloadJson',
		content: 'Download graph nodes and edges',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			
			downloadJson();
		}
	},
	{
		id: 'downloadCyJson',
		content: 'Download graph nodes and edges',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			
			downloadCyJson();
		}
	},
		{
		id: 'saveJson',
		content: 'Save graph nodes and edges',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			
			saveJson();
		}
	}]
});

cy.edgehandles({
	complete: (source, target, created) => {
		// Remove edge. After form it will be created definitively.
		created.remove();
		showEdgeForm({
			source: {gid: source.id()},
			target: {gid: target.id()}
		});
	}
});


cy.on('mouseover', 'node', function(){
	let ptext='';
	if (typeof this.data('title') !== 'undefined'){
      ptext= "<div id='ptext'><b> "+ this.data('title') + "</b>";
      ptext = ptext + "</br><i>" + this.data('label') + "</i>";
   }
   if (typeof this.data('description') !== 'undefined'){
     console.log(this.data('description'));
     ptext=ptext + "</br>" + this.data('description'); 
   }
   if (typeof this.data('url') !== 'undefined'){
      ptext = ptext + "</br><a href='"+ this.data('url') + "'>" + this.data('url') + "</a></div>";
   }
   
   var element = document.getElementById('sidebar');

   element.insertAdjacentHTML('beforeend',  ptext);

});
   
cy.on('mouseout', 'node', function(){
	
   var element = document.getElementById('ptext');
   if (element !== null){
   	element.parentNode.removeChild(element);
   }

});
      
   
   
cy.on('tap', 'node', function(){
  
  if (typeof this.data('url') !== 'undefined'){
	  try { // your browser may block popups
	    window.open( this.data('url') );
	  } catch(e){ // fall back on url change
	    window.location.href = this.data('url');
	  }
	}
	
});

d3.select("#showNodeForm").on("click", function () {
	showNodeForm({x: +1000, y: -300, gn:groupNodes() });
});

d3.select("#showGroupForm").on("click", function () {
	showGroupForm({x: +1000, y: -300, gn:groupNodes() });
});


// click on save
d3.select("#save").on("click", function () {
	saveJson();
});

d3.select("#download").on("click", function () {
	downloadJson();
});

d3.select("#cy-download").on("click", function () {
	downloadCyJson();
});

d3.select("#export").on("click", function () {
	exportPNG();
});

d3.select("#filter").on("click", function () {
	showFilterForm();
});


// click on help
d3.select("#help").on("click", function () {

	var event = d3.event;
	event.preventDefault();
	event.stopPropagation();
	toggleShowHelp();
});



// Background

const background = new Image();


function loadBackGround(bgImage){
background.onload = () => {
	const bottomLayer = cy.cyCanvas({
		zIndex: -1
	});
	const canvas = bottomLayer.getCanvas();
	const ctx = canvas.getContext("2d");
   
   
	cy.on("render cyCanvas.resize", evt => {
		bottomLayer.resetTransform(ctx);
	   	
		bottomLayer.setTransform(ctx);
      bottomLayer.clear(ctx); 
		ctx.save();
		// Draw a background
		ctx.drawImage(background, -700, -270);
         
		// Draw text that follows the model
		ctx.font = "24px Helvetica";
		ctx.fillStyle = "black";
		ctx.fillText("", 300, 300);

		// Draw shadows under nodes
		ctx.shadowColor = "black";
		ctx.shadowBlur = 25 * cy.zoom();
		ctx.fillStyle = "beige";
		cy.nodes().forEach(node => {
			const pos = node.position();
			ctx.beginPath();
			ctx.arc(pos.x*1.05, pos.y, 10, 0, 2 * Math.PI, false);
			ctx.fill();
		});
		ctx.restore();

		// Draw text that is fixed in the canvas
		bottomLayer.resetTransform(ctx);
			
		ctx.save();
		
		ctx.font = "24px Helvetica";
		ctx.fillStyle = "red";
	   ctx.fillText('', 450, 40);
		ctx.restore();
	});
}
	   background.src = "./images/"+bgImage ;

}

function jstest2(){
  	//var pTitle="Politiek";
	//var parentNode= cy.filter("node[title = 'Probleem']");
	
}

jstest2();

function test(){
   var element = document.getElementById('file-content');
   element.textContent = "test function";
   console.log("test function");
}

var groupNodes = function() {
  var collection= cy.filter("node[label = 'Group']");
  var groups=[];
  
  for(let element of collection) {
  	  var group=[];
  	  group.id=element.data('id');
  	  group.name=element.data('title'); 
  	  groups.push(group);
  }	
//  console.log(groups);  
  return groups;
}

d3.select("#setvars").on("click", function () {
	toggleShowSettings();
	if (settings) {
		//console.log('setting');
		var event = d3.event;
		event.preventDefault();
		event.stopPropagation();
		showFilterForm();
		form
	} else {
		d3.select('#settings').select('sform').remove();
	}
});






function saveJson() {
    const nodes=cy.nodes();
    console.log(nodes);
    console.log(model.nodes);
	 nodes.lock();
	 model.title=cy.data('title');
	 model.background=cy.data('background');
	 model.layout=cy.data('layout');
	 
	 const jsonModel=model.$export();
	 console.log(jsonModel);
	 name=cy.data('title');	 
	 
	 //console.log(cy.data('title'));
	 console.log(name);
	 var filename = name.split(' ').join('_') + '.json';
	 const json = cy.json(); // take json from cytoscape
    console.log(json);
  // download json as you want
    const datafile= JSON.stringify(jsonModel);
    console.log(datafile);
	 
	 //var filename=name + '.json';
	 var params = "data=" + datafile;
	//console.log(filename);
	//console.log(jsonfile);
	//console.log(params);
	var url = "savegraph.php";//your url to the server side file that will receive the data.
	var http = new XMLHttpRequest();
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function () {//Call a function when the state changes.
		if (http.readyState == 4 && http.status == 200) {
			alert(filename + ' saved ' + http.responseText);//check if the data was received successfully.
		}
	}
	http.send(params);
}

function exportPNG() {
	 console.log(model.nodes);
	 var png64 = cy.png('bg:red'); // take png from cytoscape
    const json2 = cy.elements().jsons();

    var a = document.createElement("a"); //Create <a>
    a.href = png64; //Image Base64 Goes here
    a.download = "Image.png"; //File name Here
    a.click(); //Downloaded file

}

function export2graph() {
	var width = graph.scrollWidth,
		height = graph.scrollHeight;
	var svgDataUrl = 'data:image/svg+xml;charset=utf-8,' +
		new XMLSerializer().serializeToString(graph)
			.replace(/#/g, '%23').replace(/\n/g, '%0A');

	var link = document.createElement('a');
	link.download = 'export.svg';
	link.href = svgDataUrl;
	link.click();
}

function downloadCyJson() {
	 
    const nodes=cy.nodes();
	 nodes.lock();
	 const json = cy.json(); // take json from cytoscape
    const json2 = cy.elements().jsons(); 
    //console.log(json2);
    name=cy.data('title');	 
	 //console.log(cy.data('title'));
	 console.log(name);
	 var filename = name.split(' ').join('_') + '.json';
    
  // download json as you want
    const data2 = JSON.stringify(json);
    //console.log (data2);
    var myFile = new File([data2], filename, {type: "text/json;charset=utf-8"});
    saveAs(myFile);

};

function downloadJson() {
	 
    const jsonModel=model.$export();
	 console.log(jsonModel);
	 name=cy.data('title');	 
	 
	 //console.log(cy.data('title'));
	 console.log(name);
	 var filename = name.split(' ').join('_') + '.json';
	 
  // download json as you want
    const data2= JSON.stringify(jsonModel);
    
  // download json as you want
    var myFile = new File([data2], filename, {type: "text/json;charset=utf-8"});
    saveAs(myFile);

};



function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    //displayContents(contents);
    return contents;
  };
  reader.readAsText(file);
}

function displayContents(divid,contents) {
  var element = document.getElementById(divid);
  element.textContent = contents;
}




function unlockNode(node) {
	node.unlock();
}

function createNode(node) {
	console.log(node);
	return model.nodes.add(node);
}

function createEdge(edge) {
	return model.edges.add(edge);
}	

function createGroup(node) {
	
	node.label="Group";
   
	return cy.add({
		group: 'nodes',
		data: {...node},
		classes: ['entity'],
		position: {
			x: node.x || 0,
			y: node.y || 0
		}
	});
}



function updateGraph(data) {

	//console.log(data);
	applyLayout(data['layout']);
	loadBackGround(data['background']);
	displayContents('gtitle', data['title']);
}


function updateNode(data) {
	console.log(data);
	const node = nodeMapping.getModelByGid(data.gid);
	console.log(node);	
	console.log(node.title);
	if(!node) throw new Error(`Node '${data.gid}' not found. Cannot update.`);

	node.$setData(data);
	return node;
}

function updateEdge(data) {
	console.log(data);
	const edge = edgeMapping.getModelByGid(data.gid);
	if(!edge) throw new Error(`Edge '${data.gid}' not found. Cannot update.`);

	edge.$setData(data);
	return edge;
}


function applyLayout(name, elements = undefined) {
	const options = LAYOUTS[name] || {name};
   
	// By default, take all elements
	if(!elements) elements = cy.filter(()=>true);

	if(!elements.length) return;

	const defaults = {
		animate: true,
		fit: elements.length === cy.filter(()=>true).length // do not fit for partial layouts
	};

	document.querySelector('.layout-name').innerHTML = '';

	cy.layout({
		...defaults,
		...options
	}).run();
}

function filter() {
	event.preventDefault();

	const input = document.querySelector('#search');
	const query= "node[title = '" + input.value + "']";
	if(query.length === 0) {
		cy.filter(()=>true).unselect();
	} else {
		const found = cy.filter(query);
		cy.filter(()=>true).difference(found).unselect();
		found.select();
	}
}

function filterLabels(){
	const labels=["Probleem", "Oorzaak", "Oplossing", "Maatregel","Voorbeeld","Onderzoek","Document","Actor","Opmerking","Group"];
	console.log(labels);
   var sform = d3.select('#settings')
	.style('display', 'block')
	.append('sform').attr('id', 'labelf');
	sform.append('H3').text("Filter");
	//var select = sform.append('select').attr('label', 'Group').attr('id', 'group').attr('title', 'group');
	var selectLabels=sform.append('div')
	for (var i = 0; i < labels.length; i++) {
		
		selectLabels.append('input')
		.attr('type','checkbox')
		.attr('id', 'group')
		.attr('name', 'group')		
		.attr('value', labels[i])
		.property("checked")
		selectLabels.append ('label').text(labels[i]);
//		.attr('name', groupNodes()[i]['name']);	
		//console.log(labels[i]);
	}
	selectLabels.append('input')
		.attr('type','checkbox')
		.attr('onclick', checkAll())
		selectLabels.append ('label').text('Check All');
	selectLabels.append('input')
		.attr('type','checkbox')
		.attr('onclick', uncheckAll())
		selectLabels.append ('label').text('Uncheck All');
	selectLabels.append('button')
		.attr('type','button')
		.attr('id','submit')
		.attr('onclick', inputChange())
		.attr('id','submit')
		.attr('value', 'submit').text('submit');
	selectLabels.append('H3').text("Filterxxxxxx");	
   console.log(sform);

	sform.append(selectLabels);
	d3.selectAll("input[type=checkbox]").property("checked", true);

   sform.append('H3').text("Filterxxxxxx");	
   console.log(sform);

	var d3div = sform.append('div');
	d3div.append('button').attr('type', 'button').attr('id', 'submit').attr('onclick', inputChange()).attr('value', 'submit').text('submit');
	sform.append(d3div);
	
	var submitForm = d3.select('#settings');
	var d3div = submitForm.append('div');
	d3div.append('button').attr('type', 'button').attr('id', 'submit').attr('onclick', inputChange()).attr('value', 'submit').text('submit');
   settings.append(d3div);
   
	var inputElems = d3.selectAll("input[type=checkbox]").property("checked", true);
	console.log(inputElems);


	function formsubmit() {
		alert('submitted:' + zoom + " " + example);
		//graphviz.destroy();
		render();
	}

	function inputChange() {
      console.log("change");
		console.log(inputElems);

	}

  function checkAll() {
	   d3.selectAll("input[type=checkbox]").property("checked", true);
	}
	function uncheckAll() {
      d3.selectAll("input[type=checkbox]").property("checked", false);
		} 

	inputElems.on("change", inputChange);
	d3.select("#submit").on("click", formsubmit);

}

 
	

// UI
function showGraphForm() {
   
	$('#modal-form').modal('show');
	showForm(cy.data(), formSchemaGraph, () => {

		updateGraph(cy.data());
		
		$('#modal-form').modal('hide');
	});
}


// UI
// UI
function showNodeForm(presets = {}) {
	$('#modal-form').modal('show');
	showForm(presets, formSchemaNode, () => {
		presets.gid ? updateNode(presets) : createNode(presets);
		$('#modal-form').modal('hide');
	});
}

function showEdgeForm(presets = {}) {
	console.log(presets);
	console.log(presets.source.gid);

	$('#modal-form').modal('show');
	showForm(presets, formSchemaEdge, () => {
		presets.gid ? updateEdge(presets) : createEdge(presets);
		$('#modal-form').modal('hide');
	});
}

function showGroupForm(node = {}) {
	if(_.isFunction(node.isNode) && node.isNode()) {
		node = exportNode(node);
	}
	console.log(node);
	if(!_.isPlainObject(node)) throw new Error("Presets argument must be node or plain object.");
   
	$('#modal-form').modal('show');
	showForm(node, formSchemaGroup, () => {

		node.id ? updateNode(node) : createGroup(node);
		
		
		$('#modal-form').modal('hide');
	});
}


function showFilterForm(presets = {}) {
	  
	$('#modal-form').modal('show');
	showForm(presets,formSchemaFilter, data => {
		cy.filter().unselect();

		for(let select of data.Labels) {
		   const query = "node[label = '" + select + "']";
			const found = cy.filter(query);		
			found.select();
		}
			
		$('#modal-form').modal('hide');
	});
}


function exportNode(node) {
	console.log(node.data());
	return {
		...node.data(),
		x: node.position('x'),
		y: node.position('y'),
		gn: groupNodes()
	}
}

function exportEdge(edge) {
	return edge.data();
}

function toggleShowHelp() {
	showHelp = !showHelp;
	if (showHelp) {
		d3.select("#help-text").style("display", "block");
	} else {
		d3.select("#help-text").style("display", "none");
	}
}

function toggleShowSettings() {
				settings = !settings;
				if (settings) {
					d3.select("#settings").style("display", "block");
				} else {
					d3.select('#settings').select('sform').remove();
					d3.select('#settings').select('div').remove();
					d3.select('#settings').style("display", "none");
				}
			}

window.graph = {
	applyLayout,
	fetchFile,
	fetchFile2,
	fetchFile3,
	filter,
	toolbar,
	jstest2,
	groupNodes,
	fileread,
	saveJson,
	showNodeForm,
	showGroupForm,
	showFilterForm,
	showGraphForm
};
