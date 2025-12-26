import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    limit,
    orderBy,
    Timestamp
} from 'firebase/firestore';

export interface BlogArticle {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: 'Analysis' | 'News' | 'Tutorial';
    coverImage: string;
    sport?: string;
    publishedAt: any;
    tags: string[];
    views: number;
}

class BlogService {
    private collectionName = 'articles';

    /**
     * Get all published articles ordered by date
     */
    async getArticles(count = 10): Promise<BlogArticle[]> {
        try {
            if (!db) return [];
            const articlesRef = collection(db, this.collectionName);
            const q = query(
                articlesRef,
                orderBy('publishedAt', 'desc'),
                limit(count)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as BlogArticle));
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    }

    /**
     * Get a single article by its slug
     */
    async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
        try {
            if (!db) return null;
            const articlesRef = collection(db, this.collectionName);
            const q = query(articlesRef, where('slug', '==', slug), limit(1));

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return null;

            const docData = querySnapshot.docs[0];
            return {
                id: docData.id,
                ...docData.data()
            } as BlogArticle;
        } catch (error) {
            console.error('Error fetching article by slug:', error);
            return null;
        }
    }

    /**
     * Get featured articles (for homepage)
     */
    async getFeaturedArticles(): Promise<BlogArticle[]> {
        return this.getArticles(3);
    }
}

export const blogService = new BlogService();
