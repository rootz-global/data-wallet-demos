import Component from "./Component.mjs";
import {InputText} from "./InputText.mjs";
import {InputSlider} from "./InputSlider.mjs";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.refreshTimer = null;
        this.hub = true;
        this.scopes = ['global','country','region','city'];
        this.periods = ['all time','year','month','week','day'];
    }
    async render(element) {
        await super.render(element);
        await this.pingView()
        this.word = this.new(InputText,{data:{},name:"word", placeholder:"one word",hideTitle:true});
        await this.word.render(this.element);
        this.sendButton = this.div('send-button',this.word.element);
        this.sendButton.innerHTML = `<span class='icon icon-paper-plane'></span>`;

        this.inputField = this.word.element.querySelector('input');

        this.inputField.addEventListener('input',async (e)=>{
            e.target.value = e.target.value.toLowerCase();
            e.target.value = e.target.value.replace(/[^A-Za-z']/g,"");
        })
        this.inputField.addEventListener('keypress',async (e)=>{
            if (e.keyCode === 13) await this.pingWord.call(this);
        })

        this.sendButton.addEventListener('click', this.pingWord.bind(this));

        // chart
        this.trending = document.createElement('iframe');
        this.element.append(this.trending);

        // controls
        this.scopeSlider = this.new(InputSlider,{data:{scope:1},name:'scope',values:this.scopes});
        await this.scopeSlider.render(this.element);
        this.periodSlider = this.new(InputSlider,{data:{period:2},name:'period',values:this.periods});
        await this.periodSlider.render(this.element);
        this.scopeSlider.element

        // ad box
        this.adBox = this.div('ad-box');

        this.refresh(0);
    }
    async handleUpdate(attributeName) {
        await super.handleUpdate(attributeName);
        if (attributeName === 'scope') {
            this.refresh();
        } else if (attributeName ==='period') {
            this.refresh();
        }
    }
    async pingWord() {
        if (!this.word.value) return;
        await fetch(`https://metric.im/ping/silent/word?word=${this.word.value.toLowerCase()}&_auth=${this.props.context.key}`);
        this.word.value = "";
        this.refresh(0);
    }
    async pingView() {
        let result = await fetch(`https://metric.im/ping/json/view?site=tweezer.com&path=home&_auth=${this.props.context.key}`);
        this.context = await result.json();
    }
    refresh(wait=1000) {
        if (this.refreshTimer) clearTimeout(this.refreshTimer);
        setTimeout(async ()=>{
            this.trending.src = this.query();
            this.adBox.innerHTML = await this.adText();
        },wait);
    }
    query(format='chart.bar',entries=12) {
        let dimensions = ['word'];
        let days = "";
        if (this.scopeSlider.value > 0) {
            if (this.context[this.scopes[this.scopeSlider.value]]) {
                let value = this.context[this.scopes[this.scopeSlider.value]];
                if (value) dimensions.push('!'+this.scopes[this.scopeSlider.value]+':'+value);
            }
        }
        if (this.periodSlider.value > 0) {
            days = 'days='+[3650,365,20,7,1][this.periodSlider.value]+'&';
        }
        return `http://localhost:3000/pull/${format}/word/${dimensions.join(',')}/_count?${days}last=${entries}&sort=_count&_auth=${this.props.context.key}`;
    }
    async adText() {
        let results = await fetch(this.query('json',1));
        if (results) {
            let data = await results.json();
            return `ad for keyword <b>${data[0].word}</b>`;
        } else {
            return "";
        }
    }
}
