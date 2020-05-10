// datamodel.js
// @author Ben Stevens / ben@supernova.me

var DataModel = (function(){
	function DataModel()
	{
		var data;
		var exhibitions = [];
		var artworks = [];
		var artists = [];
		
		var current_exhibition_id;
		
		
		/*
		PRIVATE FUNCTIONS
		*/
		
		function setExhibitions( _e )
		{
			exhibitions = _e;
		}
		
		
		function setArtworks( _a )
		{
			artworks = _a;
		}
		
		function setArtists( _a )
		{
			artists = _a;
		}
		
		function setCurrentExhibitionID( _id )
		{
			current_exhibition_id = _id;
		}
		
		/*
		PUBLIC FUNCTIONS
		*/
		
		function updateData( _data )
		{
			data = _data.data;

			setExhibitions( data.exhibitions.exhibition );
			setArtworks( data.artworks.artwork );
			setArtists( data.artists.artist );
			setCurrentExhibitionID( data.exhibitions.current );
		}
		
		function getExhibitions()
		{
			return exhibitions;
		}
		
		function getArtworks()
		{
			return artworks;
		}
		
		function getArtists()
		{
			return artists;
		}
		
		function getCurrentExhibitionID()
		{
			return current_exhibition_id;
		}
		
		function getExhibitionByID( _id )
		{
			//error if only 1 exhibition
			
			for(var _ex in exhibitions)
			{
				if(exhibitions[_ex].id == _id)
				{
					return exhibitions[_ex];
				}
			}
			return null;
		}
		
		function getArtworkByID( _id )
		{
			//error if only 1 artwork
			
			for (var _a in artworks)
			{
				if( artworks[_a].id == _id )
				{
					return artworks[_a];
				}
			}
			return null;
		}
		
		function getArtistByID( _id )
		{
			//error if only 1 artist
			
			for (var _a in artists)
			{
				if( artists[_a].id == _id )
				{
					return artists[_a];
				}
			}
			return null;
		}
		
		
		return {
			
			update: updateData,
			exhibitions: getExhibitions,
			artworks: getArtworks,
			artists: getArtists,
			currentExhibitionID: getCurrentExhibitionID,
			getArtworkByID: getArtworkByID,
			getExhibitionByID: getExhibitionByID,
			getArtistByID: getArtistByID
			
		};
	}
	
	var instance;

	return {
		getInstance: function(){
			if (instance == null) {
				instance = new DataModel();
				// Hide the constructor so the returned objected can't be new'd...
				instance.constructor = null;
			}
			return instance;
		}
	};
})();