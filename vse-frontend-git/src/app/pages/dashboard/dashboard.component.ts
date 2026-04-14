import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { EditDialogComponent } from './edit-dialog/edit-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { VseService } from '../../services/vse.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,        // ✅ Handles NgIf, NgFor (Angular 21 way)
    MatCardModule,       // ✅ mat-card
    MatTableModule,       // ✅ mat-table, matRowDef
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  displayedColumns: string[] = ['employee', 'goals', 'rating', 'year', 'action'];   // 👈 THIS MUST EXIST
  //dataSource: any[] = [];
 dataSource = new MatTableDataSource<any>([]); //👈 Using MatTableDataSources

 @ViewChild(MatPaginator) paginator!: MatPaginator;
 @ViewChild(MatSort) sort!: MatSort;
 
  constructor(
  private vseService: VseService,
  private dialog: MatDialog
) {}


  ngOnInit() {
 this.loadSubmissions();
  }

  ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;

  // 🔥 FIX sorting for ALL columns
  this.dataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'employee':
        return item.employeeId?.toLowerCase();
      case 'goals':
        return item.goalsAchieved?.toLowerCase();
      case 'rating':
        return item.selfRating?.toLowerCase();
      case 'year':
        return item.year;
      default:
        return '';
    }
  };
}



loadSubmissions() {
    this.vseService.getAll().subscribe({
      next: (data) => {this.dataSource.data = data,
      //this.dataSource.paginator = this.paginator; we use ngafterviewinit to set paginator and sort, so no need to set here again
      //this.dataSource.sort = this.sort;
      console.log('Data loaded', data)
      },
      error: (err) => console.error('Load failed', err)
    });
  }

  edit(row: any) {

  const dialogRef = this.dialog.open(EditDialogComponent, {
    width: '400px',
    data: { ...row } // clone to avoid auto-change
  });

  dialogRef.afterClosed().subscribe(result => {
    if (!result) return;

    this.vseService.update(row.id, result).subscribe({
      next: () => this.loadSubmissions(),
      error: err => alert('Update failed')
    });
  });
}


  // 🗑 Delete record
  delete(id: number) {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    this.vseService.delete(id).subscribe({
      next: () => {
        // Refresh table after delete
        this.loadSubmissions();
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Delete failed');
      }
    });
  }
}