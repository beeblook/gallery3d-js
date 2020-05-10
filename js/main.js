// main.js

var Main = function () {

	var model;	
	var gallery;
		
	var current_view;
		
	/*
		
	PRIVATE FUNCTIONS
		
	*/
		
	function updateExhibitionsList()
	{
		$("#exhibit-list-grid").empty();
			
		var _cols = Math.floor( $("#exhibit-list-grid").innerWidth()/190 );
		var _col_arrays = new Array(_cols);
			
		for(var _c = 0; _c<_cols; _c++)
		{
			_col_arrays[_c] = [];
			$("#exhibit-list-grid").append('<div class="exhibit-list-grid-column"></div>');	
		}
			
		var _col = 0;
			
		for(var _e in model.exhibitions())
		{
			//console.log(_col);
			var _ex = model.exhibitions()[_e];
			var _poster = {
				src:_ex.poster, 
				size:_ex.postersize.split(",")
			};
					
			_col_arrays[_col].push( {e: _ex, posy: 0} );
				
			//console.log(_ex.exhibition_title);
			$(".exhibit-list-grid-column").eq(_col)
			.append('<div class="exhibit-list-grid-cell"><a href="exhibitions/'+_ex.id+'/" class="exhibition-link"><img src="" alt="'+_ex.exhibition_title+'" width="'+ _poster.size[0] +'" height="'+ _poster.size[1] +'"></a></div>');
				
			_col++;
			_col >= _cols ? _col = 0 : null;
		}
			
		$("#exhibit-list-timeline ul").empty();
		//model.exhibitions() should be sorted chronologically
		//set range of dates
		var _newest = new Date(model.exhibitions()[0].enddate);
		var _oldest = new Date(model.exhibitions()[model.exhibitions().length-1].startdate);
			
		//roll back through time
		var _months = [_newest];
		var _pointer = _newest.getTime();
		while(_pointer > _oldest.getTime())
		{
			_newest.getMonth()
			_pointer -= 24 * 60 * 60 * 1000;
				
			var _nd = new Date(_pointer);
				
				
			if( String(_nd.getFullYear() + "/" + _nd.getMonth()) != String(_months[_months.length-1].getFullYear() + "/" + _months[_months.length-1].getMonth()) )
			{
				$("#exhibit-list-timeline ul").append("<li>"+dateToMonthString(_nd)+ " " + _nd.getFullYear() + "</li>");
				_months.push(_nd);
			}
		}
	}
		
	function hideMenu()
	{
		$("#overlay").slideUp( 500,"easeOutQuad" );
		current_view = "";
	}
		
	function showMenu()
	{
		$("#overlay").slideDown( 500,"easeOutQuad" );
		current_view = "EXHIBIT_LIST";
		updateExhibitionsList();
	}
		
	function hideBox()
	{
		//hide the box, re-enable the gallery
		$("#box").slideUp( 500,"easeOutQuad" );
		gallery.enable();
	}
		
	function showBox()
	{
		//show the box
			
		$("#box-content").css("left",0);
		$("#box").slideDown( 500,"easeOutQuad", function(){
			$('#artwork-info').css('display','block');
			$("#artwork-info").scrollTop(0);
		});
	}
		
	function dateToMonthString( _d )
	{
		var _str;
			
		switch(_d.getMonth())
		{
		case 0:
			_str="January";
			break;
		case 1:
			_str="February";
			break;
		case 2:
			_str="March";
			break;
		case 3:
			_str="April";
			break;
		case 4:
			_str="May";
			break;
		case 5:
			_str="June";
			break;
		case 6:
			_str="July";
			break;
		case 7:
			_str="August";
			break;
		case 8:
			_str="September";
			break;
		case 9:
			_str="October";
			break;
		case 10:
			_str="November";
			break;
		case 11:
			_str="December";
			break;
		default:
			_str="";
			break
		}
		return _str;
	}
						
	/*
		
	PUBLIC FUNCTIONS
		
	*/
        
	function initialize( _g, _c )
	{
		model = DataModel.getInstance();
			
		gallery = _g;
		//initialize the gallery
		var _galleryInitialized = gallery.init(_c, "");
			
		if(_galleryInitialized)
		{
			gallery.animate();
		}
		else
		{
			//show "No WebGL" message
			$('div#gallery3D').append('<div class="error-msg"><p>Your web browser does not support WebGL.</p><p>Please use Google Chrome or Firefox to view the gallery.</p></div>');	
		}
			
		$("#menu-button").click( function(evt){
			//console.log("click");
			evt.stopPropagation();
			$("#overlay").is( ":visible" ) ? hideMenu() : showMenu();			
		});
			
		$('#exhibit-list-grid').on('click', 'a', function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			hideMenu();
		});
			
		$('#box-content').on('click', 'span.artist_info_link', function(evt) {
				
			//make sure artist info is scrolled to top
			$("#artist-info").scrollTop(0);
				
			$('#box-content').animate({
				left: '-780',
			}, 250, "easeOutQuad", function() {
				// Animation complete.
			});
		});
			
		$('#box-back-arrow').click( function(evt) {
				
			//make sure artwork info is scrolled to top
			$("#artwork-info").scrollTop(0);
				
			$('#box-content').animate({
				left: '0',
			}, 250, "easeOutQuad", function() {
				// Animation complete.
			});
		});
			
		$('#box-close-icon').click( function (){
			hideBox();
		});
			
			
		$(window).resize(function() {
			
			switch(current_view)
			{
			case "EXHIBIT_LIST":
						
				updateExhibitionsList();
				break;
					
			default:
				break;
			}
		});
			
	}
		
	function showArtworkInfoPanel( _aid )
	{
		var _artwork = model.getArtworkByID( _aid );
		var _artist = model.getArtistByID( _artwork.artistid );
			
		//console.log( _artist );
			
		//update the artwork info
		$('#artwork-box').empty();
		$('#artwork-box').append('<img src="'+ _artwork.artwork_image +'" />');
		$('#artwork-info h2').html( _artwork.artwork_title );
		$('#artwork-info span.artist_info_link').html( _artist.artist_name );
		$('#artwork-info span.info').html( _artwork.artwork_description );
			
		//update the artist info
		$('#artist-mugshot').empty();
		$('#artist-mugshot').append('<img src="'+ _artist.artist_image +'" />');
		$('#artist-info span.artist_info_label').html( _artist.artist_name );
		$('#artist-info span.info').html( _artist.artist_description );
			
			
		gallery.disable();
		$("#box").is( ":visible" ) ? hideBox() : showBox();			
	}
		
	function updateData()
	{
		$.getJSON( 'data.json', function( _data )
		{
			model.update( _data );	
		} )
		
		.done(function( json ) {
			console.log( "Data loaded successfully" );
			gallery.update();
		})
		
		.fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Data Failed: " + err );
		});
	}
		

	// Reveal public pointers to  
	// private functions and properties

	return {
		init: initialize,
		showArtworkInfo: showArtworkInfoPanel,
		getData: updateData
	};

}();

