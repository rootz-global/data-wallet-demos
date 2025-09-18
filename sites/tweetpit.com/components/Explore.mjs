import Component from "./Component.mjs";

export default class Explore extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.content = this.div();
        this.content.innerHTML = `
            The data here is very agile. Here are a few examples.
            <p><a href="https://metric.im/pull/chart.line/word/word,%3Ccountry/_count?sort=_count&last=10&_auth=${this.props.context.key}">Trending words by country</a></p>
            <p><a href="https://metric.im/pull/chart.pie/word/region/_count?sort=_count&last=10&_auth=${this.props.context.key}">Activity by region</a></p>
            <p><a href="https://metric.im/pull/chart.line/word/word,%3Cbrowser/_count?sort=_count&last=10&_auth=${this.props.context.key}">Trending words by browser</a></p>
            <p><a href="https://metric.im/pull/chart.line/word/word,%3Cdate/_count?sort=_date:-1,_count:-1&days=7&last=12&_auth=${this.props.context.key}">Weekly trends</a></p>
            <p><a href="https://metric.im/pull/map.heat/word/word,latitude,longitude/_count?_auth=${this.props.context.key}">Geographic heat map</a></p>
            <p>Custom query builder coming...</p>
        `;
    }
}
