import Component from "./Component.mjs";

export default class PageFooter extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        let year = moment().format("YYYY");
        let version = this.props.context.version;
        this.element.innerHTML =
            `<span>Solaux™ | 2022 &copy; Copyright. All rights Reserved.</span>`+
            `<span class="version-label">version ${version}</span>`;
    }
}
