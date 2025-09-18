import Component from "./Component.mjs";

export default class PageMenu extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        let tray = this.div("nav-tray");
        for (let item of (this.props.menu||[])) {
            let btn = this.div('nav-button');
            btn.innerHTML = `<span class="icon icon-${item.icon}"></span><span class="text">${item.title}</span>`;
            btn.addEventListener('click',()=>{
                document.location.href = item.target;
            })
        }
    }
}
