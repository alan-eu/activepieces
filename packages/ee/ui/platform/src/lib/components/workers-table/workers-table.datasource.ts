import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { WorkerMachine } from '@activepieces/shared';
import { WorkersService } from '../../service/workers.service';

/**
 * Data source for the LogsTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class WorkersTableDataSource extends DataSource<WorkerMachine> {
  data: WorkerMachine[] = [];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(private workersService: WorkersService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */

  connect(): Observable<WorkerMachine[]> {
    this.isLoading$.next(true);
    return this.workersService.list().pipe(
      tap((res) => {
        this.isLoading$.next(false);
        this.data = res;
      })
    );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {
    //ignore
  }
}
