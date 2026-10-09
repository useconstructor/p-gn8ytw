import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS articulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        comprado INTEGER DEFAULT 0,
        fecha_creacion TEXT DEFAULT (datetime('now'))
      )
    `);

    const tableInfo = await db.execute("PRAGMA table_info(articulos)");
    const hasCantidad = tableInfo.rows.some((row: Record<string, unknown>) => row.name === "cantidad");
    if (!hasCantidad) {
      await db.execute("ALTER TABLE articulos ADD COLUMN cantidad INTEGER NOT NULL DEFAULT 1");
    }

    const { rows } = await db.execute(
      "SELECT * FROM articulos ORDER BY fecha_creacion DESC"
    );
    return Response.json(rows);
  } catch (error) {
    console.error("Error fetching articulos:", error);
    return Response.json(
      { error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nombre = body.nombre?.trim();
    const cantidad = Number(body.cantidad);

    if (!nombre) {
      return Response.json(
        { error: "El artículo no puede estar vacío" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return Response.json(
        { error: "La cantidad debe ser un número entero positivo" },
        { status: 400 }
      );
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS articulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        comprado INTEGER DEFAULT 0,
        fecha_creacion TEXT DEFAULT (datetime('now'))
      )
    `);

    const result = await db.execute({
      sql: "INSERT INTO articulos (nombre, cantidad) VALUES (?, ?)",
      args: [nombre, cantidad],
    });

    const { rows } = await db.execute({
      sql: "SELECT * FROM articulos WHERE id = ?",
      args: [result.lastInsertRowid],
    });

    return Response.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating articulo:", error);
    return Response.json(
      { error: "Error al agregar el artículo" },
      { status: 500 }
    );
  }
}
