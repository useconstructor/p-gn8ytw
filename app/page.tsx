"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface Articulo {
  id: number;
  nombre: string;
  cantidad: number;
  comprado: number;
  fecha_creacion: string;
}

export default function Home() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [nuevoArticulo, setNuevoArticulo] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchArticulos = useCallback(async () => {
    try {
      const res = await fetch("/api/articulos");
      if (!res.ok) throw new Error("Error al cargar los artículos");
      const data = await res.json();
      setArticulos(data);
      setError(null);
    } catch {
      setError("Error al conectar con la base de datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticulos();
  }, [fetchArticulos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nuevoArticulo.trim();
    const cantidadNum = Number(nuevaCantidad);

    if (!trimmed) {
      setValidationError("El artículo no puede estar vacío");
      return;
    }

    if (!Number.isInteger(cantidadNum) || cantidadNum < 1) {
      setValidationError("La cantidad debe ser un número entero positivo");
      return;
    }

    setValidationError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/articulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: trimmed, cantidad: cantidadNum }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar el artículo");
      }

      const newArticulo = await res.json();
      setArticulos((prev) => [newArticulo, ...prev]);
      setNuevoArticulo("");
      setNuevaCantidad("1");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar el artículo");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComprado = async (articulo: Articulo) => {
    const newComprado = articulo.comprado ? 0 : 1;

    setArticulos((prev) =>
      prev.map((a) =>
        a.id === articulo.id ? { ...a, comprado: newComprado } : a
      )
    );

    try {
      const res = await fetch(`/api/articulos/${articulo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprado: newComprado }),
      });

      if (!res.ok) throw new Error("Error al actualizar");
    } catch {
      setArticulos((prev) =>
        prev.map((a) =>
          a.id === articulo.id ? { ...a, comprado: articulo.comprado } : a
        )
      );
      setError("Error al actualizar el artículo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro?")) return;

    const prevArticulos = articulos;
    setArticulos((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/articulos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");
    } catch {
      setArticulos(prevArticulos);
      setError("Error al eliminar el artículo");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
        <p className="mt-4 text-[#555]">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-3 sm:px-6">
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-2xl font-bold text-[#333] mb-6">
          Lista de Compras
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              Cerrar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoArticulo}
              onChange={(e) => {
                setNuevoArticulo(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Agregar artículo"
              className="flex-1 px-4 py-2 border border-[#DDD] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              disabled={submitting}
            />
            <input
              type="number"
              value={nuevaCantidad}
              onChange={(e) => {
                setNuevaCantidad(e.target.value);
                if (validationError) setValidationError(null);
              }}
              min="1"
              placeholder="Cant."
              className="w-20 px-3 py-2 border border-[#DDD] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0066CC] text-white text-xs font-medium rounded hover:bg-[#0055AA] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Agregar
            </button>
          </div>
          {validationError && (
            <p className="mt-2 text-sm text-red-600">{validationError}</p>
          )}
        </form>

        {articulos.length === 0 ? (
          <div className="text-center py-12 text-[#999]">
            Tu lista está vacía. ¡Comienza a agregar artículos!
          </div>
        ) : (
          <ul className="border border-[#DDD] rounded overflow-hidden">
            {articulos.map((articulo, index) => (
              <li
                key={articulo.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-[#F9F9F9]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!articulo.comprado}
                  onChange={() => toggleComprado(articulo)}
                  className="h-4 w-4 rounded border-[#DDD] text-[#0066CC] focus:ring-[#0066CC] cursor-pointer"
                />
                <span
                  className={`flex-1 text-xs ${
                    articulo.comprado
                      ? "line-through text-[#999]"
                      : "text-[#555]"
                  }`}
                >
                  {articulo.nombre} ({articulo.cantidad})
                </span>
                <button
                  onClick={() => handleDelete(articulo.id)}
                  className="p-1 text-[#DC3545] hover:bg-red-50 rounded transition-colors duration-200"
                  aria-label="Eliminar artículo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
