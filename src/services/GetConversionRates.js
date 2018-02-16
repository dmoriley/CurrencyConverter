    /**
     * Get the conversion data from fixer.io for all possible bases. Possible bases are: CAD, USD, EUR
     * I chose to get them all at once because of there being only 3 possible bases it would be more efficient to 
     * grab them all at once instead of constantly querying the api. If there were alot more this might not be
     * the most efficient route.
     */
    const getAllConversionData  = function (){
        let rates = {};
        return getConversionData({base:'CAD',targets:['USD','EUR']})
               .then(res => {
                    Object.assign(rates,res); //assign the conversion values for that base to the rates object
                    return getConversionData({base:'USD',targets:['CAD','EUR']}); //get next base values
               }).then(res => {
                    Object.assign(rates,res); //assign the conversion values for that base to the rates object
                    return getConversionData({base:'EUR',targets:['USD','CAD']});
               }).then(res => {
                    Object.assign(rates,res); //assign the conversion values for that base to the rates object
                    return Promise.resolve(rates); //return the rate finished rate object
               }).catch(err => {
                    return Promise.reject(err);
               });

    }

    /**
     * Get the conversion data of a supplied base for the supplied targets and set to the conversionValues property.
     * @param {*Object} ConversionObject Object with the following pattern {base: CAD, targets: ['USD','EUR']} Only one base and as many targets as you want. 
     */
    const getConversionData = function({base, targets}) {
        return fetch(`https://api.fixer.io/latest?base=${base}&symbols=${targets.toString()}`)
                .then(response => response.json()) //takes response stream and resolves to a string
                .then(responseText => {
                    responseText.rates[base] = 1; //setup 1 to 1 conversion
                    return Promise.resolve({[base]: responseText.rates});
                }).catch(err => {
                    return Promise.reject(err);
                });
    }




    
