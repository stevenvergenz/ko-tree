'use strict';

(function()
{
	ko.nestedObservable = function(data)
	{
		// create new child array
		if( data instanceof Array ){
			return ko.observableArray(data).extend({'nested': 'array'});
		}

		// create new child object
		else if( data instanceof Object ){
			return ko.observable(data).extend({'nested': 'object'});
		}

		// create new primitive observable
		else {
			return ko.observable(data);
		}
	}

	ko.extenders.nested = function(target, type)
	{
		if( type == 'array' )
		{
			target._subs = [];
			var result = ko.computed({
			
				'read': function(){
					return target();
				},

				'write': function(newval)
				{
					// stop propagating changes
					for( var i in target._subs ){
						target._subs[i].dispose();
					}

					// update sub-observables
					for( var i in newval )
					{
						if( i >= target().length ){
							target.push( ko.nestedObservable(newval[i]) );
							target()[i].humanName = i;
						}
						else if( !ko.isObservable(target()[i]) ){
							target()[i] = ko.nestedObservable(newval[i]);
							target()[i].humanName = i;
						}
						else {
							target()[i](newval[i]);
						}
					}

					// start propagating again
					for( var i in target() ){
						target._subs.push( target()[i].subscribe(function(){
							target.valueHasMutated();
						}) );
					}

					target.valueHasMutated();
					//console.log('Array type changing:', newval);
					//target(newval);
				}
				
			});

			for( var i in ko.observableArray.fn ){
				result[i] = ko.observableArray.fn[i].bind(target);
			}
			
			result(target());
			return result;
		}

		else if( type == 'object' )
		{
			target.c = {};
			var result = ko.computed({

				'read': function(){
					target();
					return target.c;
				},

				'write': function(newval)
				{
					var flag = false;

					// loop over properties
					for( var i in newval )
					{
						// update existing entries
						if( target.c.hasOwnProperty(i) ){
							target.c[i](newval[i]);
						}

						// create missing entries
						else
						{
							flag = true;
							target.c[i] = ko.nestedObservable(newval[i]);

							// subscribe parent to child updates
							target.c[i].humanName = i;
							target.c[i].subscribe(function(){
								target.valueHasMutated();
							});
						}
					}
					// signal that target has been updated if new children added
					if( flag )
						target.valueHasMutated();
				}
			});

			result(target());
			return result;
		}

		// type is neither array nor object
		else {
			return target;
		}
	};

})();
