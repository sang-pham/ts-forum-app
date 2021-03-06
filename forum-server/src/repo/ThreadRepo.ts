import { QueryArrayResult, QueryOneResult } from './QueryArrayResult';
import { Thread } from './Thread';
import { ThreadCategory } from './ThreadCategory'
import { User } from "./User";
import { isThreadBodyValid, isThreadTitleValid } from '../common/validators/ThreadValidator'

export const createThread = async (
  userId: string | undefined | null,
  categoryId: string,
  title: string,
  body: string
): Promise<QueryArrayResult<Thread>> => {
  const titleMsg = isThreadTitleValid(title)
  if (titleMsg) {
    return {
      messages: [titleMsg]
    }
  }

  const bodyMsg = isThreadBodyValid(body)
  if (bodyMsg) {
    return {
      messages: [bodyMsg]
    }
  }

  if (!userId) {
    return {
      messages: ['User must be log in']
    }
  }

  const user = await User.findOne({
    id: userId
  })

  const category = await ThreadCategory.findOne({
    id: categoryId,
  });
  if (!category) {
    return {
      messages: ["category not found."],
    };
  }

  const thread = await Thread.create({
    title, body, user, category
  }).save()
  if (!thread) {
    return {
      messages: ["Failed to create thread."],
    };
  }

  return {
    messages: ["Thread created successfully."],
  };
}

export const getThreadById = async (
  id: string
): Promise<QueryOneResult<Thread>> => {
  const thread = await
    Thread.findOne({
      where: {
        id,
      },
      relations: ["user",
        "threadItems",
        "threadItems. user",
        "category"],
    });

  if (!thread) {
    return {
      messages: ["Thread not found."],
    };
  }
  return {
    entity: thread,
  };
}

export const getThreadsByCategoryId = async (
  categoryId: string
): Promise<QueryArrayResult<Thread>> => {
  const threads = await Thread.createQueryBuilder("thread")
    .where(`thread."categoryId" = :categoryId`, { categoryId })
    .leftJoinAndSelect("thread.category", "category")
    .leftJoinAndSelect("thread.threadItems", "threadItems")
    .leftJoinAndSelect("thread.user", "user")
    .leftJoinAndSelect("thread.user", "user")
    .orderBy("thread.createdOn", "DESC")
    .getMany();

  if (!threads || threads.length === 0) {
    return {
      messages: ["Threads of category not found."],
    };
  }
  console.log(threads);
  return {
    entities: threads,
  };
}

export const getThreadsLatest = async (): Promise<QueryArrayResult<Thread>> => {
  const threads = await Thread.createQueryBuilder("thread")
    .leftJoinAndSelect("thread.category", "category")
    .leftJoinAndSelect("thread.user", "user")
    .leftJoinAndSelect("thread.threadItems", "threadItems")
    .orderBy("thread.createdOn", "DESC")
    .take(10)
    .getMany();

  if (!threads || threads.length === 0) {
    return {
      messages: ["No threads found."],
    };
  }
  console.log(threads);
  return {
    entities: threads,
  };
};