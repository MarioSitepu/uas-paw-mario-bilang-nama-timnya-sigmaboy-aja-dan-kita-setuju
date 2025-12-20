import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

// Mock data store (ideally this should be in a separate data file or API)
const articlesData = [
    {
        id: 1,
        title: '5 Kebiasaan Sehari-hari untuk Jantung yang Lebih Sehat yang Layak Anda Dapatkan.',
        excerpt: 'Temukan kebiasaan sehari-hari yang sederhana namun efektif yang dapat secara signifikan meningkatkan kesehatan kardiovaskular dan kesejahteraan Anda secara keseluruhan.',
        date: '25 Jan 2025',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80',
        readTime: '5 min',
        content: `
      <p>Kesehatan jantung adalah kunci untuk kehidupan yang panjang dan aktif. Penyakit kardiovaskular tetap menjadi penyebab utama kematian secara global, namun banyak faktor risikonya dapat dikelola melalui perubahan gaya hidup sederhana.</p>
      
      <h3>1. Bergerak Lebih Banyak</h3>
      <p>Aktivitas fisik adalah salah satu cara paling efektif untuk memperkuat otot jantung Anda. Bertujuan untuk setidaknya 30 menit olahraga intensitas sedang seperti berjalan cepat, berenang, atau bersepeda hampir setiap hari dalam seminggu.</p>
      
      <h3>2. Makan Berwarna</h3>
      <p>Diet yang kaya akan buah-buahan dan sayuran berwarna-warni menyediakan vitamin, mineral, dan antioksidan penting. Cobalah untuk mengisi setengah piring Anda dengan sayuran hijau, merah, dan oranye setiap kali makan.</p>
      
      <h3>3. Kelola Stres</h3>
      <p>Stres kronis dapat meningkatkan tekanan darah dan merusak arteri Anda. Temukan teknik manajemen stres yang cocok untuk Anda, apakah itu meditasi, yoga, menghabiskan waktu di alam, atau sekadar membaca buku yang bagus.</p>
      
      <h3>4. Prioritaskan Tidur</h3>
      <p>Kurang tidur dikaitkan dengan risiko penyakit jantung yang lebih tinggi. Usahakan untuk mendapatkan 7-9 jam tidur berkualitas setiap malam untuk memungkinkan tubuh Anda pulih dan memperbaiki diri.</p>
      
      <h3>5. Tetap Terhidrasi</h3>
      <p>Air membantu jantung Anda memompa darah dengan lebih efisien. Biasakan minum air sepanjang hari, bukan hanya saat Anda merasa haus.</p>
    `
    },
    {
        id: 2,
        title: 'Manfaat Utama Pemeriksaan Kesehatan Rutin.',
        excerpt: 'Pelajari mengapa pemeriksaan kesehatan rutin sangat penting untuk deteksi dini, pencegahan, dan mempertahankan kesehatan optimal sepanjang hidup Anda.',
        date: '20 Jan 2025',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
        readTime: '4 min',
        content: `
      <p>Banyak dari kita hanya pergi ke dokter saat merasa sakit. Namun, pendekatan reaktif ini seringkali berarti kita melewatkan kesempatan penting untuk pencegahan dan deteksi dini.</p>
      
      <h3>Pencegahan Lebih Baik daripada Pengobatan</h3>
      <p>Pemeriksaan kesehatan rutin atau medical check-up (MCU) dirancang untuk menilai kesehatan Anda secara keseluruhan dan mengidentifikasi potensi masalah sebelum menjadi serius. Ini memberi Anda kesempatan untuk mengambil tindakan pencegahan.</p>
      
      <h3>Deteksi Dini Penyakit</h3>
      <p>Kondisi seperti hipertensi, diabetes, dan kolesterol tinggi seringkali tidak menunjukkan gejala awal ("silent killers"). Melalui pemeriksaan rutin, kondisi ini dapat dideteksi dan dikelola sejak dini, mencegah komplikasi serius di kemudian hari.</p>
      
      <h3>Membangun Riwayat Kesehatan</h3>
      <p>Memiliki catatan kesehatan yang konsisten membantu dokter Anda melihat tren dari waktu ke waktu. Perubahan kecil dalam hasil tes darah dari tahun ke tahun mungkin lebih bermakna daripada satu hasil tes yang berdiri sendiri.</p>
    `
    },
    {
        id: 3,
        title: 'Hubungan Antara Stres & Kesehatan Fisik.',
        excerpt: 'Memahami bagaimana stres mempengaruhi kesehatan fisik Anda dan strategi praktis untuk mengelola stres demi kesejahteraan keseluruhan yang lebih baik.',
        date: '15 Jan 2025',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
        readTime: '6 min',
        content: `
      <p>Stres bukan hanya masalah "di kepala Anda". Ini adalah respons fisiologis nyata yang mempengaruhi hampir setiap sistem dalam tubuh Anda.</p>
      
      <h3>Respons Lawan-atau-Lari</h3>
      <p>Ketika Anda stres, tubuh Anda melepaskan hormon seperti kortisol dan adrenalin. Ini meningkatkan detak jantung dan tekanan darah Anda, mempersiapkan Anda untuk menghadapi ancaman. Namun, ketika respons ini diaktifkan secara kronis, itu dapat merusak tubuh Anda.</p>
      
      <h3>Dampak pada Sistem Kekebalan Tubuh</h3>
      <p>Stres jangka panjang dapat menekan sistem kekebalan tubuh Anda, membuat Anda lebih rentan terhadap infeksi virus seperti flu biasa, dan memperlambat penyembuhan luka.</p>
      
      <h3>Masalah Pencernaan</h3>
      <p>Ada hubungan kuat antara otak dan usus. Stres dapat mempengaruhi mikrobioma usus Anda dan memperburuk masalah pencernaan seperti IBS (Irritable Bowel Syndrome) atau maag.</p>
      
      <h3>Strategi Coping</h3>
      <p>Menyadari tanda-tanda fisik stres adalah langkah pertama. Menggabungkan aktivitas fisik, latihan pernapasan dalam, dan menjaga koneksi sosial adalah cara ampuh untuk memutus siklus stres.</p>
    `
    }
];

export const ArticleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const article = articlesData.find(a => a.id === Number(id));

    // If article not found, redirect to home or 404
    React.useEffect(() => {
        if (!article && id) {
            navigate('/404');
        }
    }, [article, id, navigate]);

    if (!article) return null;

    return (
        <div className="min-h-screen bg-background pb-20 pt-24">
            {/* Hero Header */}
            <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                    style={{ backgroundImage: `url(${article.image})` }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                </div>

                <div className="relative container-custom h-full flex flex-col justify-end pb-16 text-white">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors w-fit"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Kembali ke Beranda</span>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-blue-200 mb-4">
                        <span className="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-white">Kesehatan</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {article.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {article.readTime} Baca
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="container-custom mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Article */}
                <div className="lg:col-span-8">
                    <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-sm border border-border">
                        <div
                            className="prose prose-lg prose-blue max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Share Card */}
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border sticky top-24">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Share2 size={18} className="text-primary" />
                            Bagikan Artikel
                        </h3>
                        <div className="flex gap-2">
                            <button className="flex-1 btn btn-secondary h-10 gap-2 justify-center text-blue-600 hover:bg-blue-50">
                                <Facebook size={18} />
                            </button>
                            <button className="flex-1 btn btn-secondary h-10 gap-2 justify-center text-sky-500 hover:bg-sky-50">
                                <Twitter size={18} />
                            </button>
                            <button className="flex-1 btn btn-secondary h-10 gap-2 justify-center text-blue-700 hover:bg-blue-50">
                                <Linkedin size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Related Articles */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-4">Artikel Lainnya</h3>
                        <div className="space-y-4">
                            {articlesData
                                .filter(a => a.id !== article.id)
                                .map(related => (
                                    <Link
                                        key={related.id}
                                        to={`/articles/${related.id}`}
                                        className="group flex gap-4 items-start p-4 hover:bg-accent/50 rounded-xl transition-colors border border-transparent hover:border-border"
                                    >
                                        <div
                                            className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0"
                                            style={{ backgroundImage: `url(${related.image})` }}
                                        ></div>
                                        <div>
                                            <h4 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                {related.title}
                                            </h4>
                                            <span className="text-xs text-muted-foreground mt-2 block">{related.date}</span>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default ArticleDetail;
