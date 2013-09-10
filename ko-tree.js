'use strict';

(function()
{
	ko.extenders.nested = function(target, type)
	{
		if( type == 'array' )
		{

		}

		else if( type == 'object' )
		{
			console.log('Target is object');
			target.c = {};
			var result = ko.computed({

				'read': function(){
					return ko.toJS(target.c);
				},

				'write': function(newval)
				{
					// loop over properties
					for( var i in newval )
					{
						// update existing entries
						if( target.c.hasOwnProperty(i) ){
							console.log('Updating property', i);
							target.c[i](newval[i]);
						}

						// create missing entries
						else
						{
							// create new child array
							if( newval[i] instanceof Array ){
								console.log('Creating array property', i);
								target.c[i] = ko.observable(newval[i]).extend({'nested': 'array'});
							}

							// create new child object
							else if( newval[i] instanceof Object ){
								console.log('Creating object property', i);
								target.c[i] = ko.observable(newval[i]).extend({'nested': 'object'});
							}

							// create new primitive observable
							else {
								console.log('Creating primitive property', i);
								target.c[i] = ko.observable(newval[i]);
							}

							// subscribe parent to child updates
							target.c[i].subscribe(function(){
								target.valueHasMutated();
							});
						}
					}
				}
			});

			result(target());
			console.log('Done');
			return result;
		}

		// type is neither array nor object
		else {
			return target;
		}
	};

})();
