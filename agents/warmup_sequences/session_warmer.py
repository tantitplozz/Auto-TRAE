# 🔥 Session warming protocols

"""
Session Warmer - Advanced browser session warming for trust building
ระบบ warmup session ขั้นสูงเพื่อสร้างความน่าเชื่อถือ
"""

import asyncio
import random
import logging
from typing import List, Dict, Any, Optional
from playwright.async_api import Browser, Page
import time

logger = logging.getLogger(__name__)

class SessionWarmer:
    """
    ✅ Advanced session warming system
    สร้างความน่าเชื่อถือผ่านการจำลองพฤติกรรมผู้ใช้จริง
    """
    
    def __init__(self):
        self.warmup_patterns = {
            'casual_browsing': [
                'scroll_random',
                'hover_elements',
                'click_safe_links',
                'read_content'
            ],
            'shopping_behavior': [
                'browse_categories',
                'view_products',
                'add_to_cart',
                'check_reviews'
            ],
            'social_media': [
                'scroll_feed',
                'like_posts',
                'read_comments',
                'share_content'
            ]
        }
    
    async def warm_session(self, browser: Browser, sites: List[str], 
                          duration_minutes: int = 5) -> Dict[str, Any]:
        """
        ✅ Warm up browser session across multiple sites
        """
        try:
            logger.info(f"Starting session warmup for {len(sites)} sites")
            
            results = []
            total_start_time = time.time()
            
            for site in sites:
                try:
                    site_result = await self._warm_single_site(browser, site)
                    results.append(site_result)
                    
                    # ✅ Random delay between sites
                    await asyncio.sleep(random.uniform(2, 8))
                    
                except Exception as e:
                    logger.error(f"Failed to warm site {site}: {str(e)}")
                    results.append({
                        'site': site,
                        'success': False,
                        'error': str(e)
                    })
            
            total_duration = time.time() - total_start_time
            
            successful_sites = sum(1 for r in results if r.get('success', False))
            
            return {
                'success': successful_sites > 0,
                'sites_warmed': successful_sites,
                'total_sites': len(sites),
                'total_duration': total_duration,
                'results': results,
                'trust_score': self._calculate_trust_score(results)
            }
            
        except Exception as e:
            logger.error(f"Session warming failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'sites_warmed': 0,
                'total_sites': len(sites)
            }
    
    async def _warm_single_site(self, browser: Browser, site: str) -> Dict[str, Any]:
        """
        ✅ Warm up single site with realistic behavior
        """
        page = None
        try:
            logger.info(f"Warming site: {site}")
            
            page = await browser.new_page()
            start_time = time.time()
            
            # ✅ Navigate to site
            await page.goto(site, wait_until='domcontentloaded', timeout=30000)
            
            # ✅ Wait for page to stabilize
            await asyncio.sleep(random.uniform(1, 3))
            
            # ✅ Determine site type and apply appropriate behavior
            site_type = self._detect_site_type(site)
            behavior_pattern = self.warmup_patterns.get(site_type, self.warmup_patterns['casual_browsing'])
            
            # ✅ Execute warming behaviors
            behaviors_executed = []
            for behavior in behavior_pattern:
                try:
                    await self._execute_behavior(page, behavior)
                    behaviors_executed.append(behavior)
                    
                    # ✅ Random delay between behaviors
                    await asyncio.sleep(random.uniform(0.5, 2))
                    
                except Exception as e:
                    logger.warning(f"Behavior {behavior} failed on {site}: {str(e)}")
            
            duration = time.time() - start_time
            
            # ✅ Collect page metrics
            metrics = await self._collect_page_metrics(page)
            
            return {
                'site': site,
                'success': True,
                'duration': duration,
                'behaviors_executed': behaviors_executed,
                'site_type': site_type,
                'metrics': metrics
            }
            
        except Exception as e:
            logger.error(f"Failed to warm {site}: {str(e)}")
            return {
                'site': site,
                'success': False,
                'error': str(e)
            }
        finally:
            if page:
                await page.close()
    
    def _detect_site_type(self, site: str) -> str:
        """
        ✅ Detect site type for appropriate behavior pattern
        """
        site_lower = site.lower()
        
        if any(keyword in site_lower for keyword in ['shop', 'store', 'buy', 'amazon', 'ebay']):
            return 'shopping_behavior'
        elif any(keyword in site_lower for keyword in ['facebook', 'twitter', 'instagram', 'reddit']):
            return 'social_media'
        else:
            return 'casual_browsing'
    
    async def _execute_behavior(self, page: Page, behavior: str):
        """
        ✅ Execute specific warming behavior
        """
        try:
            if behavior == 'scroll_random':
                await self._scroll_randomly(page)
            elif behavior == 'hover_elements':
                await self._hover_random_elements(page)
            elif behavior == 'click_safe_links':
                await self._click_safe_links(page)
            elif behavior == 'read_content':
                await self._simulate_reading(page)
            elif behavior == 'browse_categories':
                await self._browse_categories(page)
            elif behavior == 'view_products':
                await self._view_products(page)
            elif behavior == 'scroll_feed':
                await self._scroll_social_feed(page)
            else:
                logger.warning(f"Unknown behavior: {behavior}")
                
        except Exception as e:
            logger.warning(f"Behavior execution failed: {behavior} - {str(e)}")
    
    async def _scroll_randomly(self, page: Page):
        """
        ✅ Simulate natural scrolling behavior
        """
        viewport_height = await page.evaluate('window.innerHeight')
        
        for _ in range(random.randint(3, 8)):
            # ✅ Random scroll distance
            scroll_distance = random.randint(100, viewport_height // 2)
            
            await page.evaluate(f'''
                window.scrollBy({{
                    top: {scroll_distance},
                    behavior: 'smooth'
                }});
            ''')
            
            # ✅ Pause like human reading
            await asyncio.sleep(random.uniform(0.8, 2.5))
    
    async def _hover_random_elements(self, page: Page):
        """
        ✅ Hover over random elements to simulate interest
        """
        try:
            # ✅ Find hoverable elements
            elements = await page.query_selector_all('a, button, [role="button"], .btn')
            
            if elements:
                # ✅ Hover over 2-4 random elements
                sample_size = min(len(elements), random.randint(2, 4))
                selected_elements = random.sample(elements, sample_size)
                
                for element in selected_elements:
                    try:
                        await element.hover()
                        await asyncio.sleep(random.uniform(0.3, 1))
                    except:
                        continue
                        
        except Exception as e:
            logger.debug(f"Hover behavior failed: {str(e)}")
    
    async def _click_safe_links(self, page: Page):
        """
        ✅ Click on safe, internal links
        """
        try:
            # ✅ Find safe links (internal, non-form)
            safe_links = await page.evaluate('''
                Array.from(document.querySelectorAll('a[href]'))
                    .filter(link => {
                        const href = link.getAttribute('href');
                        return href && 
                               !href.startsWith('mailto:') &&
                               !href.startsWith('tel:') &&
                               !href.includes('logout') &&
                               !href.includes('delete') &&
                               !link.closest('form');
                    })
                    .slice(0, 10)
                    .map(link => link.outerHTML);
            ''')
            
            if safe_links and len(safe_links) > 0:
                # ✅ Click 1-2 safe links
                for _ in range(min(2, len(safe_links))):
                    try:
                        link_selector = f'a[href]:nth-of-type({random.randint(1, min(10, len(safe_links)))})'
                        await page.click(link_selector, timeout=5000)
                        
                        # ✅ Wait and go back
                        await asyncio.sleep(random.uniform(1, 3))
                        await page.go_back()
                        await asyncio.sleep(random.uniform(0.5, 1.5))
                        
                    except:
                        continue
                        
        except Exception as e:
            logger.debug(f"Safe link clicking failed: {str(e)}")
    
    async def _simulate_reading(self, page: Page):
        """
        ✅ Simulate reading content by pausing on text
        """
        try:
            # ✅ Find text content
            text_elements = await page.query_selector_all('p, h1, h2, h3, article, .content')
            
            if text_elements:
                # ✅ "Read" 2-3 text blocks
                sample_size = min(len(text_elements), random.randint(2, 3))
                selected_elements = random.sample(text_elements, sample_size)
                
                for element in selected_elements:
                    try:
                        # ✅ Scroll element into view
                        await element.scroll_into_view_if_needed()
                        
                        # ✅ Simulate reading time based on text length
                        text_content = await element.text_content()
                        if text_content:
                            reading_time = min(5, len(text_content) / 200)  # ~200 chars per second
                            await asyncio.sleep(random.uniform(reading_time * 0.5, reading_time * 1.5))
                            
                    except:
                        continue
                        
        except Exception as e:
            logger.debug(f"Reading simulation failed: {str(e)}")
    
    async def _browse_categories(self, page: Page):
        """
        ✅ Browse product categories on shopping sites
        """
        try:
            # ✅ Look for category links
            category_selectors = [
                'nav a', '.category', '.menu a', '[data-category]',
                '.nav-link', '.category-link'
            ]
            
            for selector in category_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements and len(elements) > 0:
                        # ✅ Click random category
                        random_element = random.choice(elements[:10])  # Limit to first 10
                        await random_element.click()
                        await asyncio.sleep(random.uniform(1, 3))
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.debug(f"Category browsing failed: {str(e)}")
    
    async def _view_products(self, page: Page):
        """
        ✅ View product details on shopping sites
        """
        try:
            # ✅ Look for product links
            product_selectors = [
                '.product a', '[data-product]', '.item a',
                '.product-link', '.product-card a'
            ]
            
            for selector in product_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements and len(elements) > 0:
                        # ✅ View 1-2 products
                        for _ in range(min(2, len(elements))):
                            random_element = random.choice(elements[:5])
                            await random_element.click()
                            await asyncio.sleep(random.uniform(2, 4))
                            await page.go_back()
                            await asyncio.sleep(random.uniform(1, 2))
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.debug(f"Product viewing failed: {str(e)}")
    
    async def _scroll_social_feed(self, page: Page):
        """
        ✅ Scroll through social media feed
        """
        try:
            # ✅ Infinite scroll simulation
            for _ in range(random.randint(5, 10)):
                await page.evaluate('window.scrollBy(0, window.innerHeight * 0.8)')
                await asyncio.sleep(random.uniform(1, 3))
                
                # ✅ Occasionally scroll back up
                if random.random() < 0.3:
                    await page.evaluate('window.scrollBy(0, -window.innerHeight * 0.3)')
                    await asyncio.sleep(random.uniform(0.5, 1.5))
                    
        except Exception as e:
            logger.debug(f"Social feed scrolling failed: {str(e)}")
    
    async def _collect_page_metrics(self, page: Page) -> Dict[str, Any]:
        """
        ✅ Collect page performance and interaction metrics
        """
        try:
            metrics = await page.evaluate('''
                () => {
                    const performance = window.performance;
                    const navigation = performance.getEntriesByType('navigation')[0];
                    
                    return {
                        load_time: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                        dom_content_loaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
                        page_height: document.body.scrollHeight,
                        viewport_height: window.innerHeight,
                        links_count: document.querySelectorAll('a').length,
                        images_count: document.querySelectorAll('img').length,
                        forms_count: document.querySelectorAll('form').length
                    };
                }
            ''')
            
            return metrics
            
        except Exception as e:
            logger.debug(f"Metrics collection failed: {str(e)}")
            return {}
    
    def _calculate_trust_score(self, results: List[Dict[str, Any]]) -> float:
        """
        ✅ Calculate overall trust score based on warming results
        """
        if not results:
            return 0.0
        
        successful_results = [r for r in results if r.get('success', False)]
        
        if not successful_results:
            return 0.0
        
        # ✅ Base score from success rate
        success_rate = len(successful_results) / len(results)
        base_score = success_rate * 0.6
        
        # ✅ Bonus for behavior diversity
        all_behaviors = []
        for result in successful_results:
            all_behaviors.extend(result.get('behaviors_executed', []))
        
        unique_behaviors = len(set(all_behaviors))
        behavior_score = min(0.3, unique_behaviors * 0.05)
        
        # ✅ Bonus for duration (longer sessions = more trust)
        avg_duration = sum(r.get('duration', 0) for r in successful_results) / len(successful_results)
        duration_score = min(0.1, avg_duration / 60)  # Max 0.1 for 1+ minute sessions
        
        total_score = base_score + behavior_score + duration_score
        
        return min(1.0, total_score)
