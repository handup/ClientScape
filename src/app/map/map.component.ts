import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import * as L from 'leaflet';
import { isPlatformBrowser } from '@angular/common';
import { countriesData } from '../../geodata/countries'
import { Feature } from 'geojson';

type Author = {
    id: number;
    fullName: string;
    country: string;
    gender: "Male" | "Female" | "Other";
};

type Book = {
    id: number;
    title: string;
    language: string;
    author: Author;
};
function getColor(d: number) {
    return d > 10 ? '#800026' :
           d > 5  ? '#E31A1C' :
           d > 2   ? '#FD8D3C' :
           d > 1   ? '#FEB24C' :
           d > 0   ? '#FED976' :
                      '#FFEDA0';
}

function style(country: Feature, books: Book[] ) {
    const booksReadInCountry = books.reduce(
    (acc, b) => b.author.country == country.id ? acc + 1 : acc, 0 )
    return {
        fillColor: getColor(booksReadInCountry),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class MapComponent implements OnInit {

  private map!: L.Map;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  data: any;

  private centroid: L.LatLngExpression = [16.81897, 10.16579]; //
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      fetch("https://localhost:7042/api/Book")
      .then((response) => response.json())
      .then((bookData) => {
          this.data = bookData as Book[]
          import('leaflet').then((L) => {
            this.initMap(L, this.data);
          });
        });

    }
  }

  private initMap(L: any, data: Book[] ): void {
    this.map = L.map('map', {
      center: this.centroid,
      zoom: 6,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    const stylinCurry = (c: Feature) => style(c, data)

    L.geoJson(countriesData, {style:stylinCurry}).addTo(this.map);
  }
}
