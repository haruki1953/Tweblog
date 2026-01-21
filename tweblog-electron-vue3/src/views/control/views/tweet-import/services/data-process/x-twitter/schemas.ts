import { z } from 'zod'

export const xtwitterResSchema = z.object({
  data: z.object({
    user: z.object({
      result: z.object({
        timeline_v2: z.object({
          timeline: z.object({
            instructions: z.array(z.any())
          })
        })
      })
    })
  })
})

export const xtwitterInstructionsItemSchema = z.object({
  entries: z.array(z.any())
})

export const xtwitterEntriesItemHaveItemContentSchema = z.object({
  content: z.object({
    itemContent: z.record(z.any())
  })
})

export const xtwitterEntriesItemHaveItemsSchema = z.object({
  content: z.object({
    items: z.array(
      z.object({
        item: z.object({
          itemContent: z.record(z.any())
        })
      })
    )
  })
})

export const xtwitterTweetResultsSchema = z.object({
  result: z.object({
    core: z.any().optional(),
    legacy: z.object({
      created_at: z.string(),
      full_text: z.string(),
      id_str: z.string(),
      in_reply_to_status_id_str: z.string().optional(),
      retweeted_status_result: z.any().optional(),
      entities: z
        .object({
          media: z.array(z.any()).optional(),
          urls: z.array(z.any()).optional()
        })
        .optional()
    })
  })
})

export const xtwitterItemContentSchema = z.object({
  tweet_results: xtwitterTweetResultsSchema
})

export const xtwitterCoreUserSchema = z.object({
  user_results: z.object({
    result: z.object({
      legacy: z.object({
        screen_name: z.string()
      })
    })
  })
})

export const xtwitterMediaItemSchema = z.object({
  id_str: z.string(),
  ext_alt_text: z.string().optional(),
  media_url_https: z.string(),
  url: z.string()
})

export const xtwitterUrlsItemSchema = z.object({
  expanded_url: z.string(),
  url: z.string()
})
