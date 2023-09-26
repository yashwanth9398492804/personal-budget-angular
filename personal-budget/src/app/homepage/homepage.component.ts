import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  width = 600;
  height = 300;
  radius = Math.min(this.width, this.height) / 2;
  svg:any;
  color:any;
  pie:any;
  key:any;
  arc:any;
  outerArc:any;
  dataReady: any;
dataSource:any;

  constructor(private http: HttpClient, private dataService: DataService) {
  }

  ngOnInit(): void {
    // async data update from data service using setTimeOut
        setTimeout(() => {
            this.dataSource = this.dataService.dataSource;
            this.createChart();
            this.draw();
          }, 1000);
  }

  private createChart(): void {
    const ctx:any  = document.getElementById('myChart');
    const myPieChart = new Chart(ctx, {
      type: 'pie',
      data: this.dataSource,
    });
  }

  private getData() {
    const arr = [];
    const labels = this.dataSource.labels;
    for (let i = 0; i < this.dataSource.datasets[0].data.length; i++) {
      arr.push({
        label: labels[i],
        value: this.dataSource.datasets[0].data[i],
      });
    }
    return arr;
  }

  private midAngle(d: { startAngle: number; endAngle: number; }) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  private draw(): void {
    this.svg = d3.select('svg')
               .attr('width', this.width)
               .attr('height', this.height)
               .append('g')
               .attr('transform', 'translate(' + this.width / 2 + ',' +
                this.height / 2 + ')');
    this.radius = Math.min(this.width, this.height) / 2 ;

    this.color = d3.scaleOrdinal()
            .domain(this.dataSource.labels)
           .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    this.pie = d3.pie()
    .sort(null)
               .value((d: any) => d.value);

    this.dataReady = this.pie(this.getData());

    this.arc = d3.arc()
    .innerRadius(this.radius * 0.5)
    .outerRadius(this.radius * 0.8);

    this.outerArc = d3.arc()
    .innerRadius(this.radius * 0.9)
    .outerRadius(this.radius * 0.9);

    this.svg
  .selectAll('allSlices')
  .data(this.dataReady)
  .enter()
  .append('path')
  .attr('d', this.arc)
  .attr('fill', (d:any) => (this.color(d.data.label)))
  .attr('stroke', 'white')
  .style('stroke-width', '2px')
  .style('opacity', 0.7);

    this.svg
  .selectAll('allPolylines')
  .data(this.dataReady)
  .enter()
  .append('polyline')
    .attr('stroke', 'black')
    .style('fill', 'none')
    .attr('stroke-width', 1)
    .attr('points', (d:any) => {
        const posA = this.arc.centroid(d);
        const posB = this.outerArc.centroid(d);
        const posC = this.outerArc.centroid(d);
        posC[0] = this.radius * 0.95 * (this.midAngle(d) < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });


    this.svg
      .selectAll('allLabels')
      .data(this.dataReady)
      .enter()
      .append('text')
        .text( (d:any) => { console.log(d.data.label); return d.data.label; } )
        .attr('transform', (d:any) => {
            const pos = this.outerArc.centroid(d);
            pos[0] = this.radius * 0.99 * (this.midAngle(d) < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
          })
        .style('text-anchor', (d:any) => {
            return (this.midAngle(d) < Math.PI ? 'start' : 'end');
          });
    }
}
