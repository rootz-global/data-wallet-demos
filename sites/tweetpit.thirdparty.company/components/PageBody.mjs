import Component from "./Component.mjs";

export default class PageBody extends Component {
    constructor(props) {
        super(props);
        this.pages = {};
    }
    async render(element) {
        await super.render(element);
        let Page = await this.page(this.props.page);
        let page = new Page({context:this.props.context});
        this.element.innerHTML="";
        await page.render(this.element);
    }
    async page(id) {
        try {
            if (!this.pages[id]) this.pages[id] = await import("./"+id+".mjs");
            return this.pages[id].default;
        } catch(e) {
            console.log("unable to load page "+id);
            console.log(e);
        };
    }
}
