import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {FileDownloaded} from "@models/fileDownloaded";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpClient) {}

  getGroupement(id: number){
    return this.http.get<string>(`${environment.apiUrl}/groupementClient.php`, {
      withCredentials: true,
      params: {
        numclient: id
      }
    })
  }

  getFilesClient(id: number){
    if(id === undefined){
      return of([]);
    }

    return this.http.get<FileDownloaded[]>(`${environment.apiUrl}/loadDocClient.php`, {
      params : {
        client: id
      }
    });
  }

  getAbonnementsDoc(id: number){
   //penser a acheter des cordes bien solide et qui tranche bien les os du coue
  }

  getFilesGroupe(groupe: string){
    return this.http.get<FileDownloaded[]>(`${environment.apiUrl}/loadDocGroupe.php`, {
      params : {
        groupe: groupe
      }
    });
  }

  getFilesCampagne(campagne: string){
    return this.http.get<FileDownloaded[]>(`${environment.apiUrl}/loadDocCampagne.php`, {
      params : {
        campagne: campagne
      }
    });
  }

  uploadFileClient(id: number, payload){
    return this.http.post(`${environment.apiUrl}/uploadFiles.php`, payload,
      {
        params: {
          client: id,
          type: 'DossiersClient'
        },
        withCredentials: true,
        responseType: 'text'
      }
    );
  }

  uploadFileGroupe(groupe: string, payload){
    return this.http.post(`${environment.apiUrl}/uploadFilesGroupe.php`, payload,
      {
        params: {
          groupe: groupe
        },
        withCredentials: true,
        responseType: 'text'
      }
    );
  }

  uploadFileCampagne(campagne: string, payload){
    return this.http.post(`${environment.apiUrl}/uploadFilesCampagne.php`, payload,
      {
        params: {
          campagne: campagne
        },
        withCredentials: true,
        responseType: 'text'
      }
    );
  }




  downloadFileMarque(filename: string, marque: string) {
    this.http.get(`${environment.apiUrl}/downloadFiles.php`, {
      responseType: 'arraybuffer' ,
      params: {
        marque: marque,
        type: 'DossiersMarques',
        filename: filename
      }
    }).subscribe((data: ArrayBuffer) => {
      const blob = new Blob([data]);

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;

      link.click();

      URL.revokeObjectURL(blobUrl);
    });
  }

  downloadFileClient(filename: string, client: number) {

    this.http.get(`${environment.apiUrl}/downloadFiles.php`, {
      responseType: 'blob' ,
      params: {
        client: client,
        type: 'DossiersClient',
        filename: filename
      }
    }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Créez un URL blob
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;

      link.click();

      window.URL.revokeObjectURL(blobUrl);
    });
  }

  downloadFileGroupe(filename: string, groupe: string) {

    this.http.get(`${environment.apiUrl}/downloadFiles.php`, {
      responseType: 'blob' ,
      params: {
        groupe: groupe,
        type: 'DossiersClient',
        filename: filename
      }
    }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Créez un URL blob
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;

      link.click();

      window.URL.revokeObjectURL(blobUrl);
    });
  }

  downloadFileCampagne(filename: string, campagne: string) {

    this.http.get(`${environment.apiUrl}/downloadFiles.php`, {
      responseType: 'blob' ,
      params: {
        campagne: campagne,
        type: 'DossierCampagne',
        filename: filename
      }
    }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Créez un URL blob
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;

      link.click();

      window.URL.revokeObjectURL(blobUrl);
    });
  }

  deleteFileMarque(filename: string, marque: string){
    return this.http.get(`${environment.apiUrl}/deleteFiles.php`, {
      params: {
        marque: marque,
        type: 'DossiersMarques',
        filename: decodeURI(filename)
      },
      responseType: 'text'
    });
  }

  deleteFileClient(filename: string, client: number){
    return this.http.get(`${environment.apiUrl}/deleteFiles.php`, {
      params: {
        client: client,
        type: 'DossiersClient',
        filename: decodeURI(filename)
      },
      responseType: 'text'
    });
  }

  deleteFileGroupe(filename: string, groupe: any){
    return this.http.get(`${environment.apiUrl}/deleteFiles.php`, {
      params: {
        groupe: groupe,
        type: 'DossiersClient',
        filename: decodeURI(filename)
      },
      responseType: 'text'
    });
  }

  deleteFileCampagne(filename: string, campagne: string){
    return this.http.get(`${environment.apiUrl}/deleteFiles.php`, {
      params: {
        campagne: campagne,
        type: 'DossierCampagne',
        filename: decodeURI(filename)
      },
      responseType: 'text'
    });
  }

  uploadFileCampaign(file: File, url: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(url, formData);

  }

}
