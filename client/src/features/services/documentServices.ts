import { PRIVATE_API } from "../utils/apiConfig";
import type {
  Document,
  CreateDocumentDto,
  UpdateDocumentDto,
  FilterDocumentDto,
  PaginatedDocuments,
  DocumentView,
  DocumentVersion,
} from "../types/document.types";

interface DocumentServiceTypes {
  getAll(filters?: FilterDocumentDto): Promise<PaginatedDocuments>;
  getMyDocuments(filters?: FilterDocumentDto): Promise<PaginatedDocuments>;
  getById(id: number): Promise<Document>;
  upload(data: CreateDocumentDto, file: File): Promise<Document>;
  update(id: number, data: UpdateDocumentDto, file?: File): Promise<Document>;
  delete(id: number): Promise<{ message: string }>;
  download(id: number): Promise<Blob>;
  getViewHistory(id: number, search?: string): Promise<DocumentView[]>;
  getVersions(id: number): Promise<DocumentVersion[]>;
  downloadVersion(id: number): Promise<Blob>;
  getStats(): Promise<{
    total: number;
    totalAmount: number;
    pdfCount: number;
    wordCount: number;
    excelCount: number;
    otherCount: number;
    activeUsers: number;
  }>;
  getRecentActivities(): Promise<DocumentView[]>;
}

class DocumentService implements DocumentServiceTypes {
  // Statistika
  async getStats() {
    try {
      const response = await PRIVATE_API.get("/documents/stats");
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Bütün sənədləri gətir (filtrləmə ilə)
  async getAll(filters?: FilterDocumentDto): Promise<PaginatedDocuments> {
    try {
      const response = await PRIVATE_API.get("/documents", { params: filters });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Mənim sənədlərim
  async getMyDocuments(filters?: FilterDocumentDto): Promise<PaginatedDocuments> {
    try {
      const response = await PRIVATE_API.get("/documents/my", { params: filters });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Tək sənəd gətir
  async getById(id: number): Promise<Document> {
    try {
      const response = await PRIVATE_API.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Sənəd yüklə
  async upload(data: CreateDocumentDto, file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyName", data.companyName);
      formData.append("documentDate", data.documentDate);

      if (data.amount !== undefined) {
        formData.append("amount", String(data.amount));
      }
      if (data.documentType) {
        formData.append("documentType", data.documentType);
      }

      const response = await PRIVATE_API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Sənədi yenilə
  async update(id: number, data: UpdateDocumentDto, file?: File): Promise<Document> {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }

      // Digər sahələri əlavə et
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateDocumentDto];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await PRIVATE_API.patch(`/documents/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Sənədi sil
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await PRIVATE_API.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Sənədi yüklə (download)
  async download(id: number): Promise<Blob> {
    try {
      const response = await PRIVATE_API.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Baxış tarixçəsi
  async getViewHistory(id: number, search?: string): Promise<DocumentView[]> {
    try {
      const response = await PRIVATE_API.get(`/documents/${id}/views`, {
        params: { search },
      });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Versiyaları gətir
  async getVersions(id: number): Promise<DocumentVersion[]> {
    try {
      const response = await PRIVATE_API.get(`/documents/${id}/versions`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Versiyanı yüklə (download)
  async downloadVersion(id: number): Promise<Blob> {
    try {
      const response = await PRIVATE_API.get(`/documents/versions/${id}/download`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  // Son aktivlikləri gətir
  async getRecentActivities(): Promise<DocumentView[]> {
    try {
      const response = await PRIVATE_API.get("/documents/activities");
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  errorHandler(error: any): Error {
    const message = error.response?.data?.message || error.message || "Xəta baş verdi";
    console.error("Document Error:", message);
    return new Error(message);
  }
}

export const documentService = new DocumentService();
