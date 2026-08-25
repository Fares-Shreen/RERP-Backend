import {
    DeleteResult, HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, Types
    , UpdateQuery, PipelineStage, InsertManyOptions, MongooseUpdateQueryOptions
} from "mongoose";


abstract class baseRepository<TDocument> {
    constructor(private readonly model: Model<TDocument>) { }
    async create(data: Partial<TDocument>, options?: QueryOptions): Promise<HydratedDocument<TDocument>> {
        return await this.model.create(data)
    }
    async findAll(): Promise<HydratedDocument<TDocument>[]> {
        return await this.model.find()
    }
    async findById(id: Types.ObjectId): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findById(id)
    }
    async findOne({ filter, projection, options }: { filter?: QueryFilter<TDocument>, projection?: ProjectionType<TDocument>, options?: QueryOptions }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOne(filter, projection)
            .skip(options?.skip || 0)
            .limit(options?.limit || 0)
            .sort(options?.sort || {})
            .populate(options?.populate as PopulateOptions)
    }
    async find({ filter, projection, options }: { filter: QueryFilter<TDocument>, projection?: ProjectionType<TDocument>, options?: QueryOptions }): Promise<HydratedDocument<TDocument>[]> {
        return await this.model.find(filter, projection)
            .skip(options?.skip || 0)
            .limit(options?.limit || 0)
            .sort(options?.sort || {})
            .populate(options?.populate as PopulateOptions)

    }
    async findOneAndDelete(filter: QueryFilter<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndDelete(filter)
    }
    async deleteOne(filter: QueryFilter<TDocument>): Promise<DeleteResult> {
        return await this.model.deleteOne(filter)
    }

    async deleteMany(filter: QueryFilter<TDocument>): Promise<any> {
        return await this.model.deleteMany(filter)
    }
    async replace({ filter, replacement }: { filter: QueryFilter<TDocument>, replacement: TDocument }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOneAndReplace(filter, replacement, { returnDocument: 'after' })
    }

    async findOneAndUpdate({ filter, update, options }: { filter: QueryFilter<TDocument>, update: UpdateQuery<TDocument>, options?: QueryOptions }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndUpdate(filter, update, { returnDocument: 'after', ...options })
    }
    async pagination({ page = 1, limit = 10, sort, search, populate }: { page?: number, limit?: number, sort?: string, populate?: any, search?: any }) {

        if (page < 1) page = 1;
        if (limit < 1) limit = 1;

        const skip = (page - 1) * limit;

        const [data, totalDoc] = await Promise.all([
            this.model.find(search).skip(skip).limit(limit).sort(sort).populate(populate).exec(),
            this.model.countDocuments(search).exec()
        ]);
        const totalPages = Math.ceil(totalDoc / limit);
        return {
            meta: {
                page,
                limit,
                totalDoc,
                totalPages
            },
            data,
        }

    }
    async aggregate<TResult = any>(
        pipeline: PipelineStage[],
        options?: Record<string, any>,
    ): Promise<TResult[]> {
        return this.model.aggregate<TResult>(pipeline).option(options ?? {});
    }

    async insertMany(docs: Partial<TDocument>[], options?: InsertManyOptions): Promise<HydratedDocument<TDocument>[]> {
        const result = await this.model.insertMany(docs, options || {});
        return result as HydratedDocument<TDocument>[];
    }

    async updateMany(filter: QueryFilter<TDocument>, update: UpdateQuery<TDocument>, options?: MongooseUpdateQueryOptions<TDocument>): Promise<any> {
        return await this.model.updateMany(filter, update, options || {}).exec();
    }

    async exists(filter: QueryFilter<TDocument>): Promise<{ _id: Types.ObjectId } | null> {
        return await this.model.exists(filter).exec();
    }

    async softDelete(filter: QueryFilter<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndUpdate(
            filter,
            { isDeleted: true } as UpdateQuery<TDocument>,
            { returnDocument: 'after' }
        );
    }


}

export default baseRepository