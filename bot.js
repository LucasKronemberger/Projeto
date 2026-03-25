import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Dica de ADS: No futuro, use process.env para não expor suas chaves!
const supabase = createClient(
  'https://tiarimiqqqakaagodlou.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Sua chave aqui
);

// 1. A Função "Caçadora" (Recebe UMA url e extrai os dados)
async function capturarDadosDaPagina(browser, url) {
  const page = await browser.newPage();
  
  // 1. Simula ser um humano no Windows
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    console.log(`🔎 Analisando: ${url}`);
    
    // 2. Aumentamos o tempo de espera
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // 3. Aguarda 3 segundos extras para o React do OLX carregar os cards
    await new Promise(r => setTimeout(r, 3000));

    // 📸 DEBUG: Tira um print para você ver o que o robô vê!
    await page.screenshot({ path: 'debug.png' });

    const anuncios = await page.evaluate(() => {
      const results = [];
      // Seletor "Nuke": busca qualquer link que pareça um anúncio
      const cards = document.querySelectorAll('a[href*="/anuncio/"]');
      
      cards.forEach(card => {
        // Tentativa de pegar o título e preço de forma genérica
        const title = card.querySelector('h2')?.innerText;
        // O preço no OLX costuma estar em spans ou parágrafos com classes de texto
        const priceText = card.innerText.match(/R\$\s?(\d+\.?\d*)/)?.[0];
        const img = card.querySelector('img')?.src;

        if (title && priceText) {
          results.push({
            model: title,
            price: parseFloat(priceText.replace(/[^\d]/g, '')),
            source_url: card.href,
            image_url: img || 'https://via.placeholder.com/150',
            year: 1990 
          });
        }
      });
      return results;
    });

    return anuncios;
  } catch (err) {
    console.error(`❌ Erro em ${url}:`, err.message);
    return [];
  } finally {
    await page.close();
  }
}

// 2. A Função "Chefe" (Gerencia a lista e o banco)
async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const modelosParaBuscar = ['santana-quadrado', 'monza-tubarao', 'kadett', 'kadett-gsi', 'corcel-ii', 'del-rey', 'opala', 'caravan', 'verona', 'marajó', 'voyage-quadrado-1.8'];
  
for (const modelo of modelosParaBuscar) {
  const url = `https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/estado-rj?q=${modelo}&pe=15000`;
const anuncios = await capturarDadosDaPagina(browser, url);
console.log(`📊 Encontrados ${anuncios.length} anúncios para esta busca.`); // Adicione esta linha

if (anuncios.length === 0) {
  console.log("⚠️ Nenhum anúncio encontrado. O seletor pode estar desatualizado.");
}

    for (const carro of anuncios) {
      const precoVendaEstimado = 22000;
      const custoRestauro = 3000;
      
      // $$ROI = \frac{V_{venda} - (V_{compra} + V_{restauro})}{V_{compra} + V_{restauro}} \times 100$$
      const roi = Math.round(((precoVendaEstimado - (carro.price + custoRestauro)) / (carro.price + custoRestauro)) * 100);

      const { error } = await supabase.from('cars').upsert({
        ...carro,
        roi,
        status: 'novo'
      }, { onConflict: 'source_url' });

      if (error) console.error("Erro no Supabase:", error.message);
    }
  }

  console.log("🏁 Caçada finalizada com sucesso!");
  await browser.close();
}

// Inicia o processo
main();