import { Component, OnInit } from '@angular/core';
import { Producto } from '../../core/models/interfaces';
import { HttpService } from '../../core/services/http/http.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class ShopComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }

}
