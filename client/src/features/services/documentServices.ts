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
  markAsRead(id: number): Promise<{ success: boolean }>;
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
  getShareLink(id: number): Promise<{
    success: boolean;
    downloadUrl: string;
    document: {
      fileName: string;
      companyName: string;
      amount: number;
      documentType: string;
    };
  }>;
}

class DocumentService implements DocumentServiceTypes {
  async getStats() {
    try {
      const response = await PRIVATE_API.get("/documents/stats");
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async getAll(filters?: FilterDocumentDto): Promise<PaginatedDocuments> {
    try {
      const response = await PRIVATE_API.get("/documents", { params: filters });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async getMyDocuments(filters?: FilterDocumentDto): Promise<PaginatedDocuments> {
    try {
      const response = await PRIVATE_API.get("/documents/my", { params: filters });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async getById(id: number): Promise<Document> {
    try {
      const response = await PRIVATE_API.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async markAsRead(id: number): Promise<{ success: boolean }> {
    try {
      const response = await PRIVATE_API.post(`/documents/${id}/read`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async upload(data: CreateDocumentDto, file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyName", data.companyName);
      formData.append("documentDate", data.documentDate);

      if (data.documentNumber) {
        formData.append("documentNumber", data.documentNumber);
      }

      if (data.allowedPositions && data.allowedPositions.length > 0) {
        formData.append("allowedPositions", data.allowedPositions.join(','));
      }

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

  async update(id: number, data: UpdateDocumentDto, file?: File): Promise<Document> {
    try {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      }

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

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await PRIVATE_API.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

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

  async getVersions(id: number): Promise<DocumentVersion[]> {
    try {
      const response = await PRIVATE_API.get(`/documents/${id}/versions`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

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

  async getShareLink(id: number) {
    try {
      const response = await PRIVATE_API.post(`/documents/${id}/share`);
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async getRecentActivities(): Promise<DocumentView[]> {
    try {
      const response = await PRIVATE_API.get("/documents/activities");
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async bulkDownload(ids: number[]): Promise<Blob> {
    try {
      const response = await PRIVATE_API.post("/documents/bulk-download", { ids }, {
        responseType: "blob",
      });
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
