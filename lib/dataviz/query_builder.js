if(typeof DataViz == 'undefined') var DataViz = {};  

/*
 * Input query format sould be as follows:
 * var query = {
		select: [],
		where:[
			{
				and_or: 'and',
				statement: 'salary > 30000'
			},
			{
				and_or: 'and',
				statement: 'age > 20'
			}
		],
		group_by:[],
		order_by:[],
		limit:''
	}
 *
 */

DataViz.queryBuilder = {
	_query_vars: {
		select: [],
		where:[
			{
				and_or: '',
				statement: ''
			}
		],
		group_by:[],
		order_by:[],
		limit:''
	},
	_query_string: '',
	init: function() {
		return this;
	},
	set_query: function(query) {
		this._query_vars = query;
		return this;
	},
	get_query: function() {
		return this._query_string;
	},
	parse_vars: function() {
		var query = '';
		
		query += this.select_statement();
		query += this.where_statement(true);
		query += this.group_by_statement(true);
		
		this._query_string = query;
		return this;
	},
	select_statement: function() {
		var query = '';
		var select_var = this._query_vars.select;
		
		for(i in select_var) {
			query += select_var[i] + ',';
		}
		
		if(query.length) {
			query = query.substring(0,query.length-1);
			query = 'select ' + query;
		}
		
		return query;
	},
	where_statement: function(space){
		var query = '';
		var where_var = this._query_vars.where;
		
		for(i in where_var) {
			if(i > 0)
				query += ' '+ where_var[i].and_or + ' '+ where_var[i].statement  ;
			else 
				query += where_var[i].statement  ;
		}
		
		if(query.length) {
			query = 'where ' + query;
		}
		
		if(space) 
			query = ' ' + query ; 
		
		return query;
	},
	group_by_statement: function(space){
		var query = '';
		var group_by_var = this._query_vars.group_by;
		for(i in group_by_var) {
			if(i == 0)
				query += ' '+ group_by_var[i]  ;
			else 
				query += "," + group_by_var[i] ;
		}
		
		if(query.length) {
			query = 'group by' + query;
		}
		
		if(space) 
			query = ' ' + query ; 
		
		return query;
	},
	order_by_statement: function() {
		
	},
	limit_statement: function() {
		
	}
};