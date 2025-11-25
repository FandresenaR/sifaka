"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getLanguageFlag, generateTranslationKey } from "@/lib/translations";
import RichTextEditor from "@/components/editor/RichTextEditor";
import MediaSelector from "@/components/editor/MediaSelector";
import ImageCropper from "@/components/ui/ImageCropper";
import { Media } from "@/types/media";
import { Crop } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  lang: string;
  translationKey?: string;
  published: boolean;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  author?: {
    name?: string;
    email: string;
  };
}

export default function BlogPage() {
  // Nettoyage HTML pour coller le HTML 'propre' issu d'outils d'IA
  function sanitizeHtml(html: string) {
    if (!html) return '';

    // ÉTAPE 1 : Pré-traitement Markdown → HTML
    let processed = html;
    processed = processed.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
    processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    processed = processed.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');

    // ÉTAPE 2 : Nettoyage HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(processed, 'text/html');
    const body = doc.body;

    const allowedTags = new Set([
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'BLOCKQUOTE', 'HR', 'A', 'IMG', 'BR', 'PRE', 'CODE'
    ]);
    const allowedAttributes: Record<string, string[]> = {
      A: ['href', 'title', 'target', 'rel'],
      IMG: ['src', 'alt', 'title']
    };

    function walk(node: Node) {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
          continue;
        }
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const tag = el.tagName.toUpperCase();

          if (!allowedTags.has(tag)) {
            if (tag === 'DIV') {
              const p = doc.createElement('p');
              while (el.firstChild) {
                p.appendChild(el.firstChild);
              }
              node.replaceChild(p, el);
              walk(p);
              continue;
            }
            while (el.firstChild) {
              node.insertBefore(el.firstChild, el);
            }
            node.removeChild(el);
            continue;
          }

          if (tag === 'H3') {
            const newEl = doc.createElement('h2');
            while (el.firstChild) newEl.appendChild(el.firstChild);
            node.replaceChild(newEl, el);
            walk(newEl);
            continue;
          }

          const allowed = allowedAttributes[tag] || [];
          for (let ai = el.attributes.length - 1; ai >= 0; ai--) {
            const attr = el.attributes[ai];
            const name = attr.name.toLowerCase();
            if (!allowed.includes(name)) {
              el.removeAttribute(attr.name);
              continue;
            }
            if (tag === 'A' && name === 'href') {
              const href = el.getAttribute('href') || '';
              if (/^javascript:/i.test(href)) {
                el.removeAttribute('href');
              } else {
                el.setAttribute('rel', 'noopener noreferrer');
              }
            }
            if (tag === 'IMG' && name === 'src') {
              const src = el.getAttribute('src') || '';
              if (!/^https?:\/\//i.test(src)) {
                el.removeAttribute('src');
              }
            }
          }

          if (tag === 'P') {
            if (!el.textContent || !el.textContent.trim()) {
              node.removeChild(el);
              continue;
            }
          }

          walk(el);
        }
      }
    }

    walk(body);

    return body.innerHTML
      .replace(/<!--.*?-->/g, '')
      .replace(/\s+data-[a-z0-9-]+=("|')[^"']*("|')/gi, '')
      .replace(/\sclass=("|')[^"']*("|')/gi, '')
      .replace(/\sstyle=("|')[^"']*("|')/gi, '')
      .trim();
  }

  function htmlToMarkdown(html: string): string {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<a [^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (m, c) => c.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1').replace(/\n+/g, '\n') + '\n');
    md = md.replace(
      /<ol[^>]*>([\s\S]*?)<\/ol>/gi,
      (m: any, c: any) =>
        c.replace(
          /<li[^>]*>(.*?)<\/li>/gi,
          (m2: any, c2: any, idx: number) => `${idx + 1}. ${c2}`
        ).replace(/\n+/g, '\n') + '\n'
    );
    md = md.replace(/<br\s*\/?>(\s*)/gi, '\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    lang: "FR",
    translationKey: "",
    tags: [] as string[],
    published: false,
  });
  const [showPreview, setShowPreview] = useState(true);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (formData.content && !editingPost) {
      const text = formData.content.toLowerCase();
      const enWords = ['the', 'and', 'is', 'with', 'for', 'this'];
      const frWords = ['le', 'la', 'et', 'est', 'avec', 'pour', 'cette'];

      let enCount = 0;
      let frCount = 0;

      enWords.forEach(w => { if (text.includes(' ' + w + ' ')) enCount++; });
      frWords.forEach(w => { if (text.includes(' ' + w + ' ')) frCount++; });

      if (enCount > frCount * 1.5) {
        setFormData(prev => ({ ...prev, lang: 'EN' }));
      } else if (frCount > enCount * 1.5) {
        setFormData(prev => ({ ...prev, lang: 'FR' }));
      }
    }
  }, [formData.content, editingPost]);

  const handleLinkTranslation = async (targetPostId: string) => {
    const targetPost = posts.find(p => p.id === targetPostId);
    if (!targetPost) return;

    let key = targetPost.translationKey;

    if (!key) {
      key = generateTranslationKey(targetPost.slug);
      try {
        await fetch(`/api/blog/${targetPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...targetPost,
            translationKey: key
          }),
        });
        fetchPosts();
      } catch (error) {
        console.error("Error updating target post key:", error);
        alert("Erreur lors de la mise à jour de l'article lié. Veuillez réessayer.");
        return;
      }
    }

    setFormData(prev => ({ ...prev, translationKey: key || "" }));
  };

  const previewHtml = useMemo(() => sanitizeHtml(formData.content), [formData.content]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog?status=all", {
        credentials: "include",
      });
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: sanitizeHtml(post.content),
      excerpt: post.excerpt,
      coverImage: post.coverImage || "",
      lang: post.lang,
      translationKey: post.translationKey || "",
      tags: post.tags,
      published: post.published,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImage: "",
      lang: "FR",
      translationKey: "",
      tags: [],
      published: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPost
        ? `/api/blog/${editingPost.id}`
        : "/api/blog";
      const method = editingPost ? "PUT" : "POST";
      const contentToSave = formData.content.includes('<') ? sanitizeHtml(formData.content) : formData.content;
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: contentToSave,
        excerpt: formData.excerpt,
        coverImage: formData.coverImage,
        lang: formData.lang,
        translationKey: formData.translationKey || undefined,
        tags: formData.tags,
        published: formData.published,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingPost(null);
        resetForm();
        fetchPosts();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || "Erreur inconnue"}`);
      }
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', croppedImageBlob, 'cropped-image.jpg');
      formDataUpload.append('folder', 'zoahary-baobab');

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image rognée');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      setShowCropper(false);
    } catch (error) {
      console.error('Erreur crop:', error);
      alert('Erreur lors de la sauvegarde de l\'image rognée');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "published") return post.published;
    if (filterStatus === "draft") return !post.published;
    return true;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Articles de blog</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Liste de tous les articles de blog
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              resetForm();
              setEditingPost(null);
              setShowModal(true);
            }}
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Nouvel article
          </button>
        </div>
      </div>

      {/* Filtres par statut */}
      <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilterStatus("all")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${filterStatus === "all"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              Tous
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                {posts.length}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus("published")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${filterStatus === "published"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              Publiés
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {posts.filter(p => p.published).length}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${filterStatus === "draft"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              Brouillons
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                {posts.filter(p => !p.published).length}
              </span>
            </button>
          </nav>

          {/* Toggle vue grille/tableau */}
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${viewMode === "grid"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              title="Vue en grille"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md ${viewMode === "table"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              title="Vue en tableau"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Vue en grille */}
      {viewMode === "grid" && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">
                {filterStatus === "published" && "Aucun article publié"}
                {filterStatus === "draft" && "Aucun brouillon"}
                {filterStatus === "all" && "Aucun article trouvé"}
              </p>
              {filterStatus === "draft" && (
                <p className="text-sm mt-1">Les articles dépubliés apparaîtront ici</p>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Image de couverture */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      fill
                      sizes="100vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
                    {/* Publication Status */}
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${post.published
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                      }`}>
                      {post.published ? "Publié" : "Brouillon"}
                    </span>
                    {/* Language Badge */}
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      {getLanguageFlag(post.lang)} {post.lang}
                    </span>
                    {/* Translation Status */}
                    {post.translationKey && (
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${posts.find(p => p.translationKey === post.translationKey && p.lang !== post.lang)
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        }`}>
                        {posts.find(p => p.translationKey === post.translationKey && p.lang !== post.lang) ? '✅' : '⚠️'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate max-w-[120px]">{post.author?.name || post.author?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Modifier l'article"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Supprimer l'article"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vue en tableau */}
      {viewMode === "table" && (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Image
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Titre
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Langue
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Traduction
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Auteur
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Statut
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Date
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium">
                              {filterStatus === "published" && "Aucun article publié"}
                              {filterStatus === "draft" && "Aucun brouillon"}
                              {filterStatus === "all" && "Aucun article trouvé"}
                            </p>
                            {filterStatus === "draft" && (
                              <p className="text-xs mt-1">Les articles dépubliés apparaîtront ici</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post) => (
                        <tr key={post.id}>
                          <td className="px-3 py-4">
                            <div className="h-12 w-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                              {post.coverImage ? (
                                <Image
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                  width={80}
                                  height={48}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                  unoptimized
                                />
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">📷</span>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                            {post.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {getLanguageFlag(post.lang)} {post.lang}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {post.translationKey ? (
                              posts.find(p => p.translationKey === post.translationKey && p.lang !== post.lang) ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                  ✅ Traduit
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                  ⚠️ Non traduit
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {post.author?.name || post.author?.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${post.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                              {post.published ? "Publié" : "Brouillon"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(post)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              title="Modifier l'article"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Supprimer l'article"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingPost ? "Modifier l'article" : "Nouvel article"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Titre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      let newSlug = formData.slug;
                      // Générer le slug si le champ slug est vide ou correspond à l'ancien titre
                      if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                        newSlug = generateSlug(newTitle);
                      }
                      setFormData({ ...formData, title: newTitle, slug: newSlug });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="Titre de l'article"
                    title="Titre de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lien (slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="exemple-mon-article"
                    title="Lien unique de l'article"
                  />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                    Extrait
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="Résumé de l'article"
                    title="Résumé de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contenu
                  </label>

                  {/* RichTextEditor with sanitizer integration */}
                  <RichTextEditor
                    content={formData.content}
                    onChange={(html) => {
                      // Apply sanitizer to Tiptap output before updating state
                      const sanitized = sanitizeHtml(html);
                      setFormData({ ...formData, content: sanitized });
                    }}
                    placeholder="Contenu de l'article"
                    onImageInsert={() => setMediaSelectorOpen(true)}
                  />

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Prévisualisation HTML nettoyée</div>
                    <div className="flex items-center space-x-3">
                      <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-xs text-blue-600 dark:text-blue-400 underline">{showPreview ? 'Masquer' : 'Afficher'}</button>
                      <button type="button" onClick={() => setShowRules(prev => !prev)} className="text-xs text-gray-600 dark:text-gray-300 underline">{showRules ? 'Masquer règles' : 'Voir règles'}</button>
                    </div>
                  </div>
                  {showPreview && (
                    <div className="mt-2">
                      {/* Outer container which simulates the final site layout */}
                      <div data-article-lang={formData.lang?.toLowerCase() || 'fr'} className="max-w-4xl mx-auto">
                        {/* Inner container with prose classes that the site uses */}
                        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 prose prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      </div>
                    </div>
                  )}
                  {showRules && (
                    <div className="mt-3 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 prose max-w-none">
                      <h4>🔧 Principales règles et classes utilisées</h4>
                      <ul>
                        <li><strong>prose / prose-xl</strong> — Le rendu de l&apos;article utilise <code>{`className="prose prose-xl max-w-none text-gray-900"`}</code> et des utilitaires <code>{`prose-h2:*, prose-h3:*, prose-p:*, prose-a:*`}</code> pour cibler le style des balises.</li>
                        <li><strong>Limite de largeur</strong> — Le container d&apos;article s&apos;appuie sur <code>max-w-4xl</code> pour garantir une lecture confortable et responsive.</li>
                        <li><strong>Règles globals.css</strong> — Les sélecteurs <code>[data-article-lang] h2</code> et <code>[data-article-lang] h3</code> ajoutent décor et couleurs (ex : bordure orange sur H2 et couleur #92400e sur H3).</li>
                        <li><strong>Variables CSS</strong> — Globals.css définit <code>--font-primary</code>, <code>--font-secondary</code>, <code>--foreground-rgb</code>, <code>--text-accent</code> etc., pour les typos et couleurs globales.</li>
                        <li><strong>ArticleLangToggle</strong> — Gère la visibilité des traductions en utilisant l&apos;attribut <code>data-article-lang</code> et l&apos;attribut <code>hidden</code> pour masquer les versions non visibles.</li>
                        <li><strong>CTA et blocs</strong> — Utilisez <code>bg-amber-*</code>, <code>rounded-2xl</code>, <code>p-8</code>, <code>border-amber-100</code> pour les blocs CTA ou promos.</li>
                        <li><strong>Pas de style custom pour <code>pre</code>/<code>code</code></strong> — Aucun style spécifique pour le code n&apos;est appliqué actuellement; prévoir un plugin si besoin.</li>
                      </ul>

                      <h4>📌 Recommandations pour les rédacteurs / éditeurs</h4>
                      <ul>
                        <li>Utilisez Markdown / HTML sémantique (H1 réservé au titre de page): <code>##</code> → <code>&lt;h2&gt;</code> et <code>###</code> → <code>&lt;h3&gt;</code>.</li>
                        <li>Paragraphes: <code>&lt;p&gt;</code>. Listes: <code>&lt;ul&gt;</code>/<code>&lt;ol&gt;</code> + <code>&lt;li&gt;</code>.</li>
                        <li>Images : <code>{`<figure><img alt="..."><figcaption>`}</code> (toujours ajouter <code>alt</code>).</li>
                        <li>Liens : <code>{`<a href="...">…</a>`}</code>. Evitez <code>javascript:</code>.</li>
                        <li>Emphase : <code>&lt;strong&gt;</code> ou <code>&lt;b&gt;</code> pour mise en avant (prose-strong stylé).</li>
                        <li>Évitez styles inline et classes non sémantiques : préférez la structure sémantique pour que Tailwind <code>prose</code> applique le style correctement.</li>
                        <li>Si vous devez ajouter classes Tailwind pour mise en page spéciale, évitez de contredire <code>prose</code> (ex: <code>{`class="w-full rounded-lg"`}</code> pour images plein largeur).</li>
                        <li>Gérez les traductions comme des articles distincts et liez via <code>translationKey</code> afin que <code>ArticleLangToggle</code> fonctionne.</li>
                      </ul>

                      <h4>💡 Exemple pratique :</h4>
                      <pre><code>{`## Sous-titre principal
Texte d'intro...

### Sous-section
- Point un
- Point deux

![Alt text](/images/blog/image.jpg)

<figure>
  <img src="/images/blog/img.jpg" alt="..."/>
  <figcaption>Légende</figcaption>
</figure>

<a href="/produits" class="inline-block px-8 py-4 bg-amber-600 text-white rounded-full">Voir nos produits</a>`}</code></pre>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Langue
                    </label>
                    <select
                      value={formData.lang}
                      onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    >
                      <option value="FR">🇫🇷 Français</option>
                      <option value="EN">🇬🇧 English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lier à une traduction
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleLinkTranslation(e.target.value);
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    >
                      <option value="">Sélectionner un article...</option>
                      {posts
                        .filter(p => p.lang !== formData.lang) // Only show opposite language
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.lang}) {p.translationKey ? '✅' : ''}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Sélectionnez l&apos;article original pour lier les traductions automatiquement.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Clé de traduction
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.translationKey}
                      onChange={(e) => setFormData({ ...formData, translationKey: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      placeholder="Identifiant unique pour lier les traductions (ex: mon-article-123)"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, translationKey: generateTranslationKey(formData.slug || 'draft') })}
                      className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                      title="Générer une nouvelle clé"
                    >
                      🔄
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Identique pour toutes les versions d&apos;un même article. Laissez vide si pas de traduction.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="https://exemple.com/image.jpg"
                  />
                  {formData.coverImage && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Prévisualisation :</p>
                      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 group">
                        <Image
                          src={formData.coverImage}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                          fill
                          sizes="100vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.error-message')) {
                              parent.innerHTML = `
                                <div class="error-message flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400 text-sm p-4">
                                  <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                  </svg>
                                  <p class="font-semibold">Erreur de chargement</p>
                                  <p class="text-xs text-center mt-1">L'image ne peut pas être chargée. Vérifiez l'URL.</p>
                                </div>
                              `;
                            }
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                          }}
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => setShowCropper(true)}
                          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Rogner l'image"
                        >
                          <Crop size={20} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Astuce : Utilisez le bouton de rognage (visible au survol) pour ajuster l&apos;image au format 16:9.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label htmlFor="published-toggle" className="block text-sm font-medium text-gray-900 dark:text-white">
                        Statut de publication
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.published ? "L'article est publié et visible par tous" : "L'article est en brouillon"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="published-toggle"
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                        {formData.published ? "Publié ✓" : "Brouillon"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPost(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingPost ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <MediaSelector
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        onSelect={(media: Media) => {
          if ((window as any).__editorInsertImage) {
            (window as any).__editorInsertImage(media.url, media.alt || media.title);
          }
        }}
      />

      {showCropper && formData.coverImage && (
        <ImageCropper
          imageSrc={formData.coverImage}
          onCancel={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}
