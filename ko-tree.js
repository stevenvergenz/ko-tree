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
			target.c = {};
			var result = ko.computed({

				'read': function(){
					target();
					return target.c;
				},

				'write': function(newval)
				{
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
							// create new child array
							if( newval[i] instanceof Array ){
								target.c[i] = ko.observable(newval[i]).extend({'nested': 'array'});
							}

							// create new child object
							else if( newval[i] instanceof Object ){
								target.c[i] = ko.observable(newval[i]).extend({'nested': 'object'});
							}

							// create new primitive observable
							else {
								target.c[i] = ko.observable(newval[i]);
							}

							// subscribe parent to child updates
							target.c[i].humanName = i;
							target.c[i].subscribe(function(){
								target.valueHasMutated();
							});
						}
					}
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
