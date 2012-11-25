var DataViz = {
	query: null,
	ganerate_query: '',
	_query_elemnts: {
		select: [],
		where:[],
		group_by:[],
		order_by:[],
		limit:''
	},
	_cache_data: null,
	_local_data: {
		'chart': null
	},
	_query_opration: {
		'string': [
			'=',
			'!=',
			'starts with',
			'ends with',
			'contains',
			'matches',
			'not contain',
			'is null',
			'is not null'
		],
		'number': [
			 '<=', 
			 '<', 
			 '>', 
			 '>=', 
			 '=', 
			 '!=',
			 'is null',
			 'is not null'
		]
	},
	init: function() {
		if(!this._check_jquery()) {
			alert('jQuery Not found!');
			return;
		}
		return this;
	},
	drawVisualization: function() {
		  // To see the data that this visualization uses, browse to
			DataViz.query = new google.visualization.Query('http://spreadsheets.google.com/tq?key=0B_UVLpCtvU0NUFJNanVQaUszd2c&range=B1:C11&pub=1');
			//DataViz.query = new google.visualization.Query('http://localhost/googleviz/csvtable.php?tq=');
			// Apply query language.
			var _query = DataViz.queryBuilder.set_query(DataViz._query_elemnts).parse_vars().get_query();
			
			if(_query != '') {
				DataViz.query.setQuery(_query);
				console.log(_query);
				$('#data_viz_custom_query_value').html(_query);
			}
	      // Send the query with a callback function.
			DataViz.query.send(DataViz.handleQueryResponse);
	},
	updateVisualisation: function() {
		DataViz.drawVisualization();
		$("#data_viz_chart_form").submit();
	},
	handleQueryResponse: function(response) {
		if (response.isError()) {
			alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		    return;
		}
		
		var data = response.getDataTable();
		DataViz._cache_data = data;
		//DataViz._local_data.chart = data;
		console.log(data);
		  
		DataViz._add_fields(data.z);
		DataViz._initialize_grid(data, true);
		//DataViz._initialize_chart(data, true);
		
		/* 
		visualization_geomap = new google.visualization.GeoMap(document.getElementById('data_viz_geomap'));
		visualization_geomap.draw(data, {
				"title": ""
			}
		);
		*/
		
		DataViz._initialize_map(data, true, true);
		/*  
		visualization_timeline = new google.visualization.MotionChart(document.getElementById('data_viz_timeline'));
		visualization_timeline.draw(data, {
				"title": ""
			}
		);
		*/
		DataViz._check_component();
		DataViz._populat_available_field();
		DataViz._populate_filter();
		DataViz._populate_lat_lon();
		DataViz._update_group()
	},
	removeFilter: function(i) {
		if(typeof DataViz._query_elemnts.where[i] != 'undefined') {
			DataViz._query_elemnts.where.splice(i, 1);
			DataViz.drawVisualization();
		}
	},
	addFilter: function() {
		var field 		= $('#data_viz_available_field').val();
		var operator 	= $('#data_viz_operator').val();
		var value		= $('#data_viz_filter_value').val();
		var and_or		= $('#data_viz_and_or').val();
		if(field == '') {
			alert('Please select a field!');
			return false;
		}
		
		if(operator == '') {
			alert('Please select a operator!');
			return false;
		}
		
		if(value == '') {
			alert('Please entre a value!');
			return false;
		}
		
		var where = {
			and_or: and_or,
			statement: DataViz._cache_data.getColumnId(parseInt(field))+' '+operator+' \''+value+'\'' 
		};
		
		DataViz._query_elemnts.where.push(where);
		
		DataViz.updateVisualisation();
	},
	addGroup: function() {
		var group_by_val = $('#data_viz_available_groupby_data_field').val();
		DataViz._query_elemnts.group_by.push(DataViz._cache_data.getColumnId(parseInt(group_by_val)));
		DataViz.updateVisualisation();
	},
	_update_group: function() {
		var container = $("#data_viz_group");
		var group_by = DataViz._query_elemnts.group_by;
		
		$(container).html(
				'<div class="row-fluid">'+
			      '<div class="span12"><H6>Applied Group</H6></div>'+
				'</div>');
		
		for(i in group_by) {
			$(container).append(
			'<div class="row-fluid">'+
					'<div class="span10">'+
					'<span class="label">'+group_by[i]+'</span> </div>'+
					'<div class="span2"><button class="close" onclick="DataViz.removeGroup('+i+')">&times;</button></div>'+
			'</div>');
		}
		
	},
	removeGroup: function(i) {
		if(typeof DataViz._query_elemnts.group_by[i] != 'undefined') {
			DataViz._query_elemnts.group_by.splice(i, 1);
			DataViz.drawVisualization();
		}
	},
	_initialize_chart: function(data, cache, type) {
		if (cache)
			DataViz._draw_chart(data, type);
		else
			DataViz._draw_chart(DataViz._local_data.chart, type);
	},
	
	_draw_chart: function(data, type) {
		  //visualization_chart = new google.visualization.LineChart(document.getElementById('data_viz_chart'));
		switch(type) {
	      case 'BarChart':
			  visualization_chart = new google.visualization.BarChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": ""
		           });
		      break;
	      case 'ColumnChart':
			  visualization_chart = new google.visualization.ColumnChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": ""
		           });
		      break;
	      case 'BubbleChart':
			  visualization_chart = new google.visualization.BubbleChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": ""
		           });
		      break;
	      case 'AreaChart':
			  visualization_chart = new google.visualization.AreaChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": "",
		           });
		      break;
	      case 'PieChart':
			  visualization_chart = new google.visualization.PieChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": ""
		           });
		      break;
	      case 'MotionChart':
			  visualization_chart = new google.visualization.MotionChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": ""
		           });
		      break;
	      case 'LineChart':
	      default:
			  visualization_chart = new google.visualization.LineChart(document.getElementById('data_viz_chart'));
		      visualization_chart.draw(data, {
		             "title": ""
		           });
		      break;
		}
	},
	_initialize_grid: function(data, cache) {
		if (cache)
			DataViz._draw_grid(data);
		else
			DataViz._draw_grid(DataViz._cache_data);
	},
	_draw_grid: function(data) {
		visualization_grid = new google.visualization.Table(document.getElementById('data_viz_grid'));
	      visualization_grid.draw(data, {
	             "title": "",
				 "page" : "enable",
				 "pageSize": 10,
				 "pagingButtonsConfiguration": "auto",
				 "showRowNumber" : true,
	           }
	      );
	      $('.record-count').html(data.getNumberOfRows() + " Records");
	},
	_vizMouseOver: function(vizobj, e) {
		vizobj.setSelection([e]);
	},
	generateMap: function() {
		DataViz._initialize_map(DataViz._cache_data, false, false);
	},
	_generate_map: function(data, map, auto) {
		var geo_index = DataViz._get_lat_lon_index(data, auto);
		if (typeof(geo_index['lat']) !== 'undefined') {
			$.each (data.D, function(key, value) { 
			var myLatlng = new google.maps.LatLng(value.c[geo_index['lat']].v,value.c[geo_index['lon']].v);
			var information = '';
			$.each (value, function(i, rowdata) { 
				$.each (rowdata, function(j, rowvalue) { 
					if (j !== geo_index['lat'] && j !== geo_index['lon']) {
					information += data.z[j].label + ": " + rowvalue.v + " </br>";
					}
				});
			});
			var marker = new google.maps.Marker({
		        position: myLatlng,
		        map: map
		        });
				var infowindow = new google.maps.InfoWindow({
				    content: information
				});
	
				google.maps.event.addListener(marker, 'click', function() {
			    	infowindow.open(map,marker);
			    });
			});
		}
	},
	_get_lat_lon_index: function(data, auto) {
		
		var lat_val = ['lat','latitude'];
		var lon_val = ['lon','longitude'];
		var geo_index = {};
		if (auto) {
		$.each(data.z, function(key, value) { 
			  if ($.inArray(value.label.toLowerCase(), lat_val) !== -1) {
				  geo_index['lat'] = key;
			  }
			  if ($.inArray(value.label.toLowerCase(), lon_val) !== -1) {
				  geo_index['lon'] = key;
			  }
		});
		}
		else {
			geo_index['lat'] = $('#data_viz_available_map_lat_field').val();
			geo_index['lon'] = $('#data_viz_available_map_lon_field').val()
			
		}
		return geo_index;
	},
	_populate_lat_lon: function() {
		var geo_index = DataViz._get_lat_lon_index(DataViz._cache_data, true);
		if(typeof(geo_index['lat']) !== 'undefined') {
			//DataViz._populat_available_field(geo_index['lat'], 'data_viz_available_map_lat_field');
			$('#data_viz_available_map_lat_field').val(geo_index['lat']);
		}
		if(typeof(geo_index['lon']) !== 'undefined') {
			//DataViz._populat_available_field(geo_index['lon'], 'data_viz_available_map_lon_field');
			$('#data_viz_available_map_lon_field').val(geo_index['lon']);
		}
	},
	_initialize_map: function(data, cache, auto) {
		var mapDiv = document.getElementById('data_viz_map');
        var map = new google.maps.Map(mapDiv, {
          center: new google.maps.LatLng(28.6358, 77.2244),
          zoom: 4,
          copyrights: 'Powered by Dataviz. Map Data &copy; Goole 2012',
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        if(auto) {
        	var auto_latlon= true;
        }
        else {
        	var auto_latlon= false;
        }
        if (cache)
			DataViz._generate_map(data, map, auto_latlon);
		else
			DataViz._generate_map(DataViz._cache_data, map, auto_latlon);
		
	},
	executeQuery: function(){
		var custom_query = $('#data_viz_custom_query_value').val();
		DataViz._set_visualization_query(custom_query);
		$('#data_viz_custom_query_value').html(custom_query);
	},
	_set_visualization_query: function(query) {
		if(query) {
			DataViz.query.setQuery(query);
			console.log(query);
		} else {
			DataViz.query.setQuery(DataViz.ganerate_query);
			console.log(DataViz.ganerate_query);
		}
		DataViz._reload_visualization();
	},
	_reload_visualization: function(){
		DataViz.query.send(DataViz.handleQueryResponse);
	},
	
	_add_fields: function(cols) {
		for(i in cols) {
			DataViz._add_fields_row(cols[i]);
		}
	},
	_add_fields_row: function(col) {
		$("#data_control_pane").append(DataViz._create_fields(col.id, col.label));
	},
	_add_query_window: function() {
		var query = '';
		$("#data_control_pane").append();	
	},
	_add_chart_type: function() {
		if(typeof $('#data_control_pane_chart #chart_type').attr('id') != 'undefined') {
			return '';
		}
		var chart_type= '<select onchange="DataViz._initialize_chart(null, false, this.value)" name="chart_type" id="chart_type">'
					  + '<option value="LineChart">Line Chart</option>'
					  + '<option value="BarChart">Bar Chart</option>'
					  + '<option value="ColumnChart">Column Chart</option>'
					  + '<option value="AreaChart">Area Chart</option>'
					  + '<option value="PieChart">Pie Chart</option>'
					  + '<option value="BubbleChart">Bubble Chart</option>'
					  + '<option value="MotionChart">Motion Chart</option>'
					  + '</select>';
		$("#data_control_pane_chart").append(chart_type);
	},
	_set_query_filter: function() {
		DataViz.ganerate_query = '';
		var query = [];
		$('.data__col input').each(function(i) {
			if($(this).is(':checked')) {
				query.push($(this).val());
			}
		});
		DataViz._query_elemnts.select = query;
		DataViz.updateVisualisation();
		
	},
	_create_fields: function(id, label) {
		if(typeof $('.data__col #'+id).attr('id') != 'undefined') {
			return '';
		}
		var button = '<div class="data__col">' 
			+ '<input class="pull-left" checked="checked" '
			+ 'type="checkbox" id="'+id+'" value="'+id.toLowerCase()+'" '
			+ 'onclick="DataViz._set_query_filter()" '
			+ '/><label for="'+id+'">'+label+'</label></div>';
		return button;
	},
	_populate_filter: function() {
		var container = $("#data_viz_filter");
		var where = DataViz._query_elemnts.where;
		
		if(where.length) {
			$('#data_viz_and_or').show();
		} else {
			$('#data_viz_and_or').hide();
		}
		
		$(container).html(
				'<div class="row-fluid">'+
			      '<div class="span12"><H6>Applied Filter</H6></div>'+
				'</div>');
		
		for(i in where) {
			$(container).append(
			'<div class="row-fluid">'+
					'<div class="span10">'+
					(i>0?'<span class="label label-info">'+where[i].and_or+'</span> ':'')+
					'<span class="label">'+where[i].statement+'</span> </div>'+
					'<div class="span2"><button class="close" onclick="DataViz.removeFilter('+i+')">&times;</button></div>'+
			'</div>');
		}
		
	},
	_populat_available_field: function(index_val, id) {
		
		$(".data_viz_available_field").each(function() {
			var first_option = $(this).find('option[value=""]');
			
			$(this).html("");
			$(this).append(first_option);
			var columns = DataViz._cache_data.z;
			
			for(key in columns) {
				if (index_val && key == index_val && id != 'undefined' && $(this).attr('id') == id)
					$(this).append('<option value="'+key+'" selected="selected">'+columns[key].label+'</option>');
				else
					$(this).append('<option value="'+key+'">'+columns[key].label+'</option>');
			}
		});
		
		DataViz._populat_operator('');
	},
	_populat_operator: function(columnKey) {
		var column_type;
		if(columnKey != '')
			column_type = DataViz._cache_data.getColumnType(parseInt(columnKey));
		
		$("#data_viz_operator").html("");
		$("#data_viz_operator").append('<option value="">Select Operator</option>');
		
		switch(column_type) {
			case 'string':
			$.each(DataViz._query_opration.string, function(key, value) { 
			  $("#data_viz_operator").append('<option value="'+value+'">'+value+'</option>');
			});	
			break;
			case 'number':
			$.each(DataViz._query_opration.number, function(key, value) { 
			  $("#data_viz_operator").append('<option value="'+value+'">'+value+'</option>');
			});	
			break;
		}
		
	},
	_get_data_column: function(columnKey) {
		var column_data = [];
		$.each(DataViz._cache_data.D, function(key, value) {
			var column_data_row = [];
			column_data_row.push(value.c[columnKey].v);
			column_data.push(column_data_row);
		});
		//console.log(column_data);
		return column_data;
	},
	_populat_chart_data_series: function(columnKeys) {
		DataViz._local_data;
		var column_id;
		var column_type;
		var column_label;
		var column_data = [];
		var column_data_arr = [];
		var chart_data = new google.visualization.DataTable();
		
		for(i in columnKeys){
			var _column_data = [];
			columnKey = parseInt(columnKeys[i]);
			column_id = DataViz._cache_data.getColumnId(columnKey);
			column_type = DataViz._cache_data.getColumnType(columnKey);
			column_label = DataViz._cache_data.getColumnLabel(columnKey);
			chart_data.addColumn(column_type, column_label);
			
			_column_data = DataViz._get_data_column(columnKey);
			
			if(i == 0){
				column_data = _column_data;
			} else {
				for(j in _column_data) {
					column_data_arr.push($.merge(column_data[j],_column_data[j]));
					
				}
			}
		}
		//console.log(chart_data);
		chart_data.addRows(column_data_arr);
		DataViz._local_data.chart = chart_data;
		DataViz._initialize_chart(null, false);
	},
	generateGraph: function(form) {
		var columnKeys = [];
		var form_val = $(form).serializeArray();
		for(i in form_val) {
			columnKeys.push(form_val[i].value);
		}
		
		if(columnKeys.length > 1) {
			DataViz._populat_chart_data_series(columnKeys);
		}
		return false;
	},
	addSeries: function() {
		var columnKey = $('#data_viz_available_chart_data_field').val();
		$('#data_viz_added_series').append(
		'<div class="row-fluid">'+
				'<div class="span10">' +
				'<span class="label">' + DataViz._cache_data.getColumnId(parseInt(columnKey)) + '</span>'+
				'<input type="hidden" name="series[]" value="' + columnKey + '"/></div>' +
				'<div class="span2"><button class="close" onclick="DataViz.removeSeries(this)">&times;</button></div>' +
		'</div>');
		$("#data_viz_chart_form").submit();
	},
	removeSeries: function(button) {
		$(button).parent().parent().remove();
		$("#data_viz_chart_form").submit();
	},
	_reset_component: function() {
		$("#data_viz_grid").hide();
		$("#data_viz_geomap").hide();
		$("#data_viz_map").hide();
		$("#data_viz_chart").hide();
		$("#data_viz_timeline").hide();
	},
	_check_component: function() {
		$('#data_component button').each(function(i) {
			if($(this).hasClass('active')) {
				if($(this).hasClass('grid')){
					$("#data_viz_grid").show();
					DataViz._initialize_grid(null, false);
				}
				if($(this).hasClass('geomap')){
					$("#data_viz_geomap").show();
				}
				if($(this).hasClass('map')){
					$("#data_viz_map").show();
					DataViz._initialize_map(null, false, true);
				}
				if($(this).hasClass('chart')){
					$("#data_viz_chart").show();
					//DataViz._initialize_chart(null, false);
					DataViz._add_chart_type();
				}
				if($(this).hasClass('timeline')){
					$("#data_viz_timeline").show();
				}
			} else {
				if($(this).hasClass('grid')){
					$("#data_viz_grid").hide();
				}
				if($(this).hasClass('geomap')){
					$("#data_viz_geomap").hide();
				}
				if($(this).hasClass('map')){
					$("#data_viz_map").hide();
				}
				if($(this).hasClass('chart')){
					$("#data_viz_chart").hide();
				}
				if($(this).hasClass('timeline')){
					$("#data_viz_timeline").hide();
				}
			}
		});
	},
	_check_jquery: function() {
		if(typeof jQuery != 'undefined') {
			return true;
		}
		return false;
	},
	_load_css:function(url) {
		var oLink = document.createElement("link")
		oLink.href = url;
		oLink.rel = "stylesheet";
		oLink.type = "text/css";
		document.getElementsByTagName("head")[0].appendChild(oLink);
	},
	_load_css_to_body:function(url) {
		var oLink = document.createElement("link")
		oLink.href = url;
		oLink.rel = "stylesheet";
		oLink.type = "text/css";
		document.getElementsByTagName("body")[0].appendChild(oLink);
	},
	_load_script:function(url,callback) {
		var e = document.createElement("script");
		e.src = url;
		
		if (typeof callback != 'undefined' && callback instanceof Function ){
	 		var callbackname = 'data_callback'+(Math.random()+'').replace(/^.*\./,'');
	 		window[callbackname] = function(data){
	 			callback(data);
	 			try{ delete window[ callbackname ]; } catch(e){}
	 		}
	 		e.src += (e.src.indexOf('?')!=-1?'&':'?')+'callback='+callbackname;
	 	}
		
		e.type="text/javascript";
		document.getElementsByTagName("head")[0].appendChild(e); 
	},
	_load_script_to_body:function(url,callback) {
		var e = document.createElement("script");
		e.src = url;
		
		if (typeof callback != 'undefined' && callback instanceof Function ){
	 		var callbackname = 'data_callback'+(Math.random()+'').replace(/^.*\./,'');
	 		window[callbackname] = function(data){
	 			callback(data);
	 			try{ delete window[ callbackname ]; } catch(e){}
	 		}
	 		e.src += (e.src.indexOf('?')!=-1?'&':'?')+'callback='+callbackname;
	 	}
		
		e.type="text/javascript";
		document.getElementsByTagName("body")[0].appendChild(e); 
	}
}.init();


//fixed the toggle property to get active class element
$.fn.button.Constructor.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

    $parent && $parent
      .find('.active')
      .removeClass('active')

    this.$element.toggleClass('active')
    
    if (this.$element.hasClass('active')) {
        this.$element.trigger('active')
    } else {
    	this.$element.trigger('inactive')
    }
}

$(function(){
	$('#data_component button').on('active', function() {
		DataViz._check_component();
	});
	$('#data_component button').on('inactive', function() {
		DataViz._check_component();
	});
});