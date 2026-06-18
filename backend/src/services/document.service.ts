import { db } from '../config/database'
import { documents, documentVersions, sectors, documentCategories } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq, desc, sql, and } from 'drizzle-orm'

export async function listDocuments(sectorId?: number, categoryId?: number) {
  const query = db.select({
    id: documents.id, title: documents.title, status: documents.status,
    version: documents.version, sectorId: documents.sectorId,
    sectorName: sectors.name, categoryId: documents.categoryId,
    authorId: documents.authorId,
    updatedAt: documents.updatedAt, createdAt: documents.createdAt,
  }).from(documents).leftJoin(sectors, eq(documents.sectorId, sectors.id))
    .orderBy(desc(documents.updatedAt))

  const conditions: any[] = []
  if (sectorId) conditions.push(eq(documents.sectorId, sectorId))
  if (categoryId) conditions.push(eq(documents.categoryId, categoryId))
  if (conditions.length > 0) return await query.where(and(...conditions))
  return await query
}

export async function getDocument(id: number) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')
  return doc
}

export async function createDocument(data: {
  title: string; contentJson?: any; sectorId: number; authorId: number; categoryId?: number
}) {
  const [doc] = await db.insert(documents).values({
    title: data.title, contentJson: data.contentJson || {},
    sectorId: data.sectorId, authorId: data.authorId,
    categoryId: data.categoryId,
    status: 'draft',
  }).returning()
  return doc
}

export async function deleteDocument(docId: number) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')
  await db.delete(documentVersions).where(eq(documentVersions.documentId, docId))
  await db.delete(documents).where(eq(documents.id, docId))
  return { deleted: true }
}

export async function updateDocumentStatus(docId: number, status: string) {
  const validStatuses = ['draft', 'published', 'archived']
  if (!validStatuses.includes(status)) throw new AppError(400, 'Status inválido')

  const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')

  const [updated] = await db.update(documents).set({
    status, updatedAt: sql`NOW()`,
  }).where(eq(documents.id, docId)).returning()
  return updated
}

export async function acquireLock(docId: number, userId: number) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')

  if (doc.isEditing && doc.editingBy !== userId) {
    const expired = doc.editingExpiresAt && new Date(doc.editingExpiresAt) < new Date()
    if (!expired) throw new AppError(409, 'Documento está sendo editado por outro usuário')
  }

  await db.update(documents).set({
    isEditing: true, editingBy: userId,
    editingExpiresAt: sql`NOW() + INTERVAL '5 minutes'`,
  }).where(eq(documents.id, docId))

  return { locked: true }
}

export async function releaseLock(docId: number) {
  await db.update(documents).set({ isEditing: false, editingBy: null, editingExpiresAt: null })
    .where(eq(documents.id, docId))
  return { locked: false }
}

export async function updateDocument(docId: number, data: {
  title?: string; contentJson?: any; categoryId?: number
}, userId: number) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')

  const allowedFields: Record<string, any> = {}
  if (data.title !== undefined) allowedFields.title = data.title
  if (data.contentJson !== undefined) allowedFields.contentJson = data.contentJson
  if (data.categoryId !== undefined) allowedFields.categoryId = data.categoryId

  await db.transaction(async (tx) => {
    await tx.insert(documentVersions).values({
      documentId: docId, version: doc.version,
      contentJson: doc.contentJson, authorId: userId,
      changeDescription: 'Atualização automática',
    })

    const newVersion = doc.version + 1
    await tx.update(documents).set({
      ...allowedFields,
      version: newVersion,
      isEditing: false, editingBy: null, editingExpiresAt: null,
      updatedAt: sql`NOW()`,
    }).where(eq(documents.id, docId))
  })

  const [updated] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)
  return updated
}

export async function getVersions(docId: number) {
  return await db.select().from(documentVersions)
    .where(eq(documentVersions.documentId, docId))
    .orderBy(desc(documentVersions.version))
}

export async function listCategories(sectorId?: number) {
  const query = db.select().from(documentCategories).orderBy(documentCategories.name)
  if (sectorId) return await query.where(eq(documentCategories.sectorId, sectorId))
  return await query
}

export async function createCategory(data: {
  name: string; description?: string; parentId?: number; sectorId?: number
}) {
  const [cat] = await db.insert(documentCategories).values({
    name: data.name,
    description: data.description || null,
    parentId: data.parentId || null,
    sectorId: data.sectorId || null,
  }).returning()
  return cat
}

export async function updateCategory(id: number, data: {
  name?: string; description?: string; parentId?: number | null; sectorId?: number | null
}) {
  const [cat] = await db.select().from(documentCategories).where(eq(documentCategories.id, id)).limit(1)
  if (!cat) throw new AppError(404, 'Categoria não encontrada')

  const fields: Record<string, any> = {}
  if (data.name !== undefined) fields.name = data.name
  if (data.description !== undefined) fields.description = data.description
  if (data.parentId !== undefined) fields.parentId = data.parentId
  if (data.sectorId !== undefined) fields.sectorId = data.sectorId

  const [updated] = await db.update(documentCategories).set({
    ...fields, updatedAt: sql`NOW()`,
  }).where(eq(documentCategories.id, id)).returning()
  return updated
}

export async function deleteCategory(id: number) {
  const [cat] = await db.select().from(documentCategories).where(eq(documentCategories.id, id)).limit(1)
  if (!cat) throw new AppError(404, 'Categoria não encontrada')

  const subs = await db.select().from(documentCategories).where(eq(documentCategories.parentId, id)).limit(1)
  if (subs.length > 0) throw new AppError(400, 'Remova as subpastas antes de excluir esta pasta')

  const docCount = await db.select().from(documents).where(eq(documents.categoryId, id)).limit(1)
  if (docCount.length > 0) throw new AppError(400, 'Mova os documentos para outra pasta antes de excluir esta')

  await db.delete(documentCategories).where(eq(documentCategories.id, id))
  return { deleted: true }
}
