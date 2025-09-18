import Component from "./Component.mjs";

export default class PageHeader extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.element.innerHTML = `<h1>tweezer</h1><h2>What's on your mind, in ONE word.</h2>`
    }
}
