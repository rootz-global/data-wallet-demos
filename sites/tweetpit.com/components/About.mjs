import Component from "./Component.mjs";

export default class About extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.content = this.div();
        this.content.innerHTML = `
            In one word you can't divulge much, or maybe you can, but the point here
            is to express and follow trends without culling through social media.
            <p>Use <a href="/#Explore">Explore</a> to search trending words across
            locations, weather, disciplines.</p>
            <p>This site is driven by the open source <a href="https://metric.im">metric.im</a>
            platform. You can skip the login to explore the docs.</p>
            <p><i>There's nearly no data yet, so the charts are dull. Post stuff.</i></p>
        `;
    }
}
