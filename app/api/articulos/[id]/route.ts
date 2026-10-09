import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const fields = Object.keys(body)
      .map((k) => `${k}=?`)
      .join(", ");
    const values = Object.values(body);

    await db.execute({
      sql: `UPDATE articulos SET ${fields} WHERE id=?`,
      args: [...values, id],
    });

    const { rows } = await db.execute({
      sql: "SELECT * FROM articulos WHERE id=?",
      args: [id],
    });

    return Response.json(rows[0] ?? null);
  } catch (error) {
    console.error("Error updating articulo:", error);
    return Response.json(
      { error: "Error al actualizar el artículo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.execute({
      sql: "DELETE FROM articulos WHERE id=?",
      args: [id],
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error deleting articulo:", error);
    return Response.json(
      { error: "Error al eliminar el artículo" },
      { status: 500 }
    );
  }
}
