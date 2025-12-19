"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationPipeLine = void 0;
const paginationPipeLine = (page = '1', filter, limit = 50) => {
    const skip = (Number(page) - 1) * limit;
    return [
        ...filter,
        // {
        //   $sort: {
        //     createdAt: -1,
        //   },
        // },
        {
            $facet: {
                total: [
                    {
                        $count: 'count',
                    },
                ],
                data: [
                    {
                        $addFields: {
                            _id: '$_id',
                        },
                    },
                ],
            },
        },
        {
            $unwind: '$total',
        },
        {
            $project: {
                items: {
                    $slice: [
                        '$data',
                        skip,
                        {
                            $ifNull: [limit, '$total.count'],
                        },
                    ],
                },
                page: {
                    $literal: skip / limit + 1,
                },
                hasNextPage: {
                    $lt: [{ $multiply: [limit, Number(page)] }, '$total.count'],
                },
                totalPages: {
                    $ceil: {
                        $divide: ['$total.count', limit],
                    },
                },
                totalItems: '$total.count',
            },
        },
    ];
};
exports.paginationPipeLine = paginationPipeLine;
//# sourceMappingURL=aggregation-pipeline-pagination.js.map