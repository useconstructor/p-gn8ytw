import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS articulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        comprado INTEGER DEFAULT 0,
        fecha_creacion TEXT DEFAULT (datetime('now'))
      )
    `);

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

    if (!nombre) {
      return Response.json(
        { error: "El artículo no puede estar vacío" },
        { status: 400 }
      );
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS articulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        comprado INTEGER DEFAULT 0,
        fecha_creacion TEXT DEFAULT (datetime('now'))
      )
    `);

    const result = await db.execute({
      sql: "INSERT INTO articulos (nombre) VALUES (?)",
      args: [nombre],
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
