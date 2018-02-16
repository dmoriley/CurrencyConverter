const currentDocument = document.currentScript.ownerDocument;

class CurrencyConverter extends HTMLElement {
    constructor() {
      // If you define a constructor, always call super() first as it is required by the CE spec.
      super();

      this.state = {
          inputValue: '',
          converted: '',
          baseCurrency: 'CAD',
          targetCurrency: 'USD',
          showDisclaimer: false
      };

      //left blank for any base/target values to be added
      this.conversionValues = {};

      /* First attemp at event listening, they worked but better to put on the element itself i think
        //set up listener for when the input textbox is changed  
        this.addEventListener('keyup', e => {
            e.stopPropagation();
            this.updateConversion(e); //update the conversion number
        });


        //listen for a click event
        this.addEventListener('click', e => {
            e.stopPropagation();
            if(e.path[0].id === 'disclaimer') { //check if the disclaimer Anchor was clicked
                this.toggleDisclaimer();
            }
        });
        */
    }

    // Called when element is inserted in DOM
    connectedCallback() {
        const shadowRoot = this.attachShadow({mode: 'open'});

        // Select the template and clone it. Finally attach the cloned node to the shadowDOM's root.
        // Current document needs to be defined to get DOM access to imported HTML
        const template = currentDocument.querySelector('#currency-converter-template');
        const instance = template.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //get all the conversion data needed for the base's cad, usd and eur
        getAllConversionData().then(res => {
            this.setConversionValues(res)
            console.log(this.conversionValues);
        });

        //listener for when input-currency-type is changed
        this.shadowRoot.querySelector('#input-currency-type').addEventListener('change', e => {
            this.updateBaseType(e.target.value);
        });

        //listener for when output-currency-type is changed
        this.shadowRoot.querySelector('#output-currency-type').addEventListener('change', e => {
            this.updateTargetType(e.target.value);
        });

        //listener for when disclaimer is toggled
        this.shadowRoot.querySelector('#disclaimer').addEventListener('click', e => {
            this.toggleDisclaimer();
        });

        //set up listener for when the input textbox is changed 
        this.shadowRoot.querySelector('#input-currency').addEventListener('keyup', e => {
            this.setConversionAmount(e); //update the conversion number
        });
    }

    /**
     * Update the state of the component by passing an object with the corresponding values
     * @param {*Object} val Object to update the state values
     */
    setState(val){
        Object.assign(this.state, val);
    }

    /**
     * Update the conversionValues of the component by passing an object with the corresponding values
     * @param {*Object} val Object to update the conversionValues values
     */
    setConversionValues(val) {
        Object.assign(this.conversionValues, val);
    }
  
    /**
     * Validate the input by limiting the input to only numbers with this pattern: /^\d{1,}(\.\d{0,6})?$/
     * @param {*Event Object} e Event object passed from the element 
     */
    validateInput(e) {
        return new Promise((res,rej) => {
            let inputValue = e.path[0].value;

            //backup check on user input to only be a number
            //limited to 6 decimal places
            if(!inputValue || inputValue.match(/^\d{1,}(\.\d{0,6})?$/)){
                //this state isnt set if the pattern doesnt match preventing the user from enter letters, period first ect...
                this.setState({inputValue});            
                e.path[0].value = this.state.inputValue; //input value tied to component state
                res(inputValue);
            } else {
                //need to update textbox to inputValue before additional input was added
                e.path[0].value = this.state.inputValue;
                rej('Invalid input');
            }
        });
    }

    /**
     * Calculate the converted amount and update the value in the textbox
     */
    updateConversion() {
        let converted = this.state.inputValue;
        if(converted != '') {
            const conversionRate = this.conversionValues[this.state.baseCurrency][this.state.targetCurrency];
            converted = calculateConvertedAmount(parseFloat(this.state.inputValue), conversionRate);
            this.setState({converted});
        }
        this.shadowRoot.querySelector('#output-currency').value = converted; //set value in output box
    }

    /**
     * Update the conversion rate in the output box after validating the input 
     * @param {*Event object} e Event object from the element
     */
    setConversionAmount(e) {
        this.validateInput(e).then((res) => {
            this.updateConversion();
        }).catch((err) => {
            console.log(err);
        });

    }

     /**
      * Toggle the disclaimer info from block to none
      */
    toggleDisclaimer() {
        const current = this.shadowRoot.querySelector('#disclaimer-addition-info').style.display;
        this.shadowRoot.querySelector('#disclaimer-addition-info').style.display = (current === 'block') ? 'none' : 'block';
    }

    /**
     * Update the base currency type
     * @param {*String} baseCurrency Currency type for the base
     */
    updateBaseType(baseCurrency) {
        this.setState({baseCurrency});
        this.updateConversion();
    }

    /**
     * Update the target currency type
     * @param {*String} targetCurrency Currency type for target
     */
    updateTargetType(targetCurrency) {
        this.setState({targetCurrency});
        this.updateConversion();
    }
    
  }
  
  customElements.define('currency-converter', CurrencyConverter);