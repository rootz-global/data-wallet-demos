/**
 *
 */
import Component from './Component.mjs';
import PageHeader from './PageHeader.mjs';
import PageBody from './PageBody.mjs';
import PageMenu from './PageMenu.mjs';
import Popup from './Popup.mjs';
import Toast from "./Toast.mjs";
import API from "./API.mjs";

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.context = {key:null};
        this.page = window.location.hash.slice(1).split('/')[0] || "Home";
        window.addEventListener("hashchange",async (e)=>{
            let hash = e.newURL.split('#')[1];
            this.page = hash.split('/')[0] || "Home";
            await this.body.update({page:this.page,context:this.context});
            await this.header.update({page:this.page,context:this.context});
        });
        window.metric = this;
    }
    async render(element) {
        await super.render(element);
        await this.getKey();
        this.header = this.new(PageHeader,{page:this.page,context:this.context});
        await this.header.render(this.element);
        this.body = this.new(PageBody,{page:this.page,context:this.context});
        await this.body.render(this.element);
        await this.new(PageMenu,{context:this.context,menu:[
            {title:'Home',target:'/#Home',icon:'home'},
            {title:'explore',target:'/#Explore',icon:'globe'},
            {title:'About',target:'/#About',icon:'help'}
        ]}).render(this.element);
        this.popup = this.new(Popup,{context:this.context});
        await this.popup.render(this.element);
        this.toast = this.new(Toast,{context:this.context});
        await this.toast.render(this.element);
    }
    async getKey() {
        try {
            if (!this.key) {
                let result = await fetch('/key');
                this.context.key = await result.text();
            }
        } catch(e) {
            return "";
        }
    }
}
