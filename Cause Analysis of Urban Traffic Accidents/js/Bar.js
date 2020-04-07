class Bar {
    constructor() {
        this._width = 800;
        this._height = 500;
        this._padding = 10;
        this._offset = 35;
        this._margins = {right: 40,bottom: 40,left: 140,top: 40};
        this._scaleX = d3.scaleBand().rangeRound([0, this._width - this._margins.left - this._margins.right]);
        this._scaleY = d3.scaleLinear().range([this._height - this._margins.top - this._margins.bottom, 0]);
        this._color = '#3398DB';
        this._data = [];
        this._svg = null;
        this._body = null;
        this._tooltip = null;
        this._shadow = null;
        this._ticks = 3;
        this._key = 'key';
        this._value = 'value';
    }
    render() {
        if(!this._tooltip) {
            this._tooltip = d3.select('#body')
                .append('div')
                .style('left', '40px')
                .style('top', '30px')
                .attr('class', 'tooltip')
                .html('');
        }
        if(!this._svg) {
            this._svg = d3.select('#body')
                .append('svg')
                .attr('width', this._width)
                .attr('height', this._height)
            this.renderAxes();
            this.renderClipPath();
        }
        this.renderBody();
    }
    renderAxes() {
        let axes = this._svg.append('g')
            .attr('class', 'axes');

        this.renderXAxis(axes);
        this.renderYAxis(axes);
    }
    renderXAxis(axes) {
        let xAxis = d3.axisBottom().scale(this._scaleX)
        axes.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(${this.xStart()}, ${this.yStart()})`)
            .call(xAxis)
    }
    renderYAxis(axes) {
        let yAxis = d3.axisLeft().scale(this._scaleY).ticks(this._ticks);
        axes.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.xStart()}, ${this.yEnd()})`)
            .call(yAxis)

        d3.selectAll('.y .tick')
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', this.quadrantWidth())
            .attr('y2', 0)
    }
    renderClipPath() {
        this._svg.append('defs')
            .append('clip-path')
            .attr('id', 'body-clip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.quadrantWidth())
            .attr('height', this.quadrantHeight())
    }
    renderBody() {
        if(!this._body) {
            this._body = this._svg.append('g')
                .attr('class', 'body')
                .attr('transform', `translate(${this._margins.left},${this._margins.top})`)
                .attr('clip-path', 'url(#clipPath)')
            this.renderShadow()
        }
        this.renderBar();
        this.listenMousemove();
    }
    renderShadow() {
        this._shadow = this._body.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.everyWidth())
            .attr('height', this._scaleY(0))
            .attr('fill', '#000')
            .attr('fill-opacity', 0)
    }
    renderBar() {
        let barElements = this._body
            .selectAll('rect.bar')
            .data(this._data);

        let barEnter =  barElements
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => this._scaleX(d[this._key]) + this.everyWidth() * 0.18)
            .attr('y', () => this._scaleY(0))
            .attr('width', this.everyWidth() * 0.64)
            .attr('height', () => this.quadrantHeight() - this._scaleY(0))

        let barUpdate = barEnter
            .merge(barElements)
            .transition()
            .duration(800)
            .ease(d3.easeCubicOut)
            .attr('y', d => this._scaleY(d[this._value]))
            .attr('height', d => {
                console.log(this.quadrantHeight() - this._scaleY(d[this._value]))
                return this.quadrantHeight() - this._scaleY(d[this._value])
            });

        let barExit = barElements
            .exit()
            .transition()
            .attr('y', () => this._scaleY(0))
            .attr('height', () => this.quadrantHeight() - this._scaleY(0))
            .remove();
    }
    listenMousemove() {
        this._svg.on('mousemove', () => {
            let px = d3.event.offsetX;
            let py = d3.event.offsetY;
            if(px < this.xEnd() && px > this.xStart() && py < this.yStart() && py > this.yEnd()) {
                this.renderShadowAndTooltip(px, py, px - this.xStart());
            } else {
                this.hideShadowAndTooltip();
            }
        })
    }
    renderShadowAndTooltip(x, y, bodyX) {
        let cutIndex = Math.floor(bodyX / this.everyWidth());
        this._shadow.transition().duration(50).ease(d3.easeLinear).attr('fill-opacity', .12).attr('x', cutIndex * this.everyWidth());
        if(x > this.quadrantWidth() - this._tooltip.style('width').slice(0,-2) - this._padding * 2) {
            x = x - this._tooltip.style('width').slice(0,-2) - this._padding * 2 - this._offset * 2;
        }
        if(y > this.quadrantHeight() - this._tooltip.style('height').slice(0,-2) - this._padding * 2) {
            y = y - this._tooltip.style('height').slice(0,-2) - this._padding * 2 - this._offset * 2;
        }
        this._tooltip.html(`${this._data[cutIndex][this._key]}<br/>Count： ${this._data[cutIndex][this._value]}`).transition().duration(100).ease(d3.easeLinear).style('display', 'inline-block').style('opacity', .6).style('left', `${x + this._offset + this._padding}px`).style('top', `${y + this._offset + this._padding}px`);
    }
    hideShadowAndTooltip() {}
    everyWidth() {
        return this.quadrantWidth() / this._data.length;
    }
    quadrantWidth() {
        return this._width - this._margins.left - this._margins.right;
    }
    quadrantHeight() {
        return this._height - this._margins.top - this._margins.bottom;
    }
    xStart() {
        return this._margins.left;
    }
    xEnd() {
        return this._width - this._margins.right;
    }
    yStart() {
        return this._height - this._margins.bottom;
    }
    yEnd() {
        return this._margins.top;
    }
    scaleX(a) {
        this._scaleX = this._scaleX.domain(a);
    }
    scaleY(a) {
        this._scaleY = this._scaleY.domain(a)
    }
    key(k) {
        if(!arguments.length) return this._key;
        this._key = k;
        this.scaleX(this._data.map(d => d[this._key]))
        return this;
    }
    value(v) {
        if(!arguments.length) return this._value;
        this._value = v;
        let arr = this._data.map(d => d[this._value]);
        let ele = Math.pow(1, d3.max(arr).toString().length - 1);
        let max = Math.ceil(d3.max(arr) / ele) * ele
        this.scaleY([0,max]);
        return this;
    }
    data(data) {
        if(!arguments.length) return this._data;
        this._data = data;
        return this;
    }
}

var dataset = [{date: 'Roundabout', label: 107641},{date: 'One-way', label: 24455},{date: 'D-carriageway', label: 266655},{date: 'S-carriageway', label: 1111457},{date: 'Slip road', label: 18802},{date: 'Unknown', label: 5782}];
var bar = new Bar();
bar
    .data(dataset)
    .key('date')
    .value('label')
    .render();