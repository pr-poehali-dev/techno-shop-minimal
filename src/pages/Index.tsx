import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog' | 'cart' | 'about' | 'delivery'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('techno-products');
    const savedCart = localStorage.getItem('techno-cart');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const defaultProducts: Product[] = [
        { id: '1', name: 'Ноутбук Gaming Pro', price: 89990, category: 'Ноутбуки', image: '/placeholder.svg' },
        { id: '2', name: 'Смартфон Ultra X', price: 54990, category: 'Смартфоны', image: '/placeholder.svg' },
        { id: '3', name: 'Наушники AirMax', price: 12990, category: 'Аксессуары', image: '/placeholder.svg' }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('techno-products', JSON.stringify(defaultProducts));
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('techno-products', JSON.stringify(updatedProducts));
  };

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('techno-cart', JSON.stringify(updatedCart));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image || '/placeholder.svg'
    };

    const updatedProducts = [...products, product];
    saveProducts(updatedProducts);
    setNewProduct({ name: '', price: '', category: '', image: '' });
    setIsAddProductOpen(false);
    
    toast({
      title: 'Успешно',
      description: 'Товар добавлен в каталог'
    });
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
    toast({
      title: 'Удалено',
      description: 'Товар удален из каталога'
    });
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCart(updatedCart);
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }

    toast({
      title: 'Добавлено в корзину',
      description: product.name
    });
  };

  const removeFromCart = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    saveCart(updatedCart);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    saveCart(updatedCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const renderNavigation = () => (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Icon name="Cpu" size={28} className="text-primary" />
            <h1 className="text-2xl font-bold">Техно Комп</h1>
          </div>
          
          <div className="hidden md:flex gap-6">
            {[
              { id: 'home', label: 'Главная', icon: 'Home' },
              { id: 'catalog', label: 'Каталог', icon: 'Package' },
              { id: 'about', label: 'О магазине', icon: 'Info' },
              { id: 'delivery', label: 'Доставка', icon: 'Truck' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.id ? 'bg-primary text-white' : 'hover:bg-secondary'
                }`}
              >
                <Icon name={item.icon as any} size={18} />
                {item.label}
              </button>
            ))}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Icon name="ShoppingCart" size={20} />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Корзина</SheetTitle>
              </SheetHeader>
              {renderCart()}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="space-y-12">
      <section className="relative bg-gradient-to-r from-primary to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Техно Комп</h2>
          <p className="text-xl mb-8">Современная техника для вашего комфорта</p>
          <Button size="lg" variant="secondary" onClick={() => setCurrentPage('catalog')}>
            Перейти в каталог
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-8">Популярные товары</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {products.slice(0, 3).map(product => (
            <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <Badge className="mb-2">{product.category}</Badge>
              <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
              <p className="text-2xl font-bold text-primary mb-4">{product.price.toLocaleString('ru-RU')} ₽</p>
              <Button onClick={() => addToCart(product)} className="w-full">
                <Icon name="ShoppingCart" size={18} className="mr-2" />
                В корзину
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Каталог товаров</h2>
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый товар</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название товара *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Введите название"
                />
              </div>
              <div>
                <Label htmlFor="price">Цена *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="category">Категория *</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Например: Ноутбуки"
                />
              </div>
              <div>
                <Label htmlFor="image">URL изображения</Label>
                <Input
                  id="image"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="/placeholder.svg"
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Добавить товар
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Package" size={64} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Товары отсутствуют</p>
          <p className="text-sm text-muted-foreground mt-2">Добавьте первый товар в каталог</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
              <Badge className="mb-2">{product.category}</Badge>
              <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
              <p className="text-2xl font-bold text-primary mb-4">{product.price.toLocaleString('ru-RU')} ₽</p>
              <Button onClick={() => addToCart(product)} className="w-full">
                <Icon name="ShoppingCart" size={18} className="mr-2" />
                В корзину
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="mt-6 space-y-4">
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="ShoppingCart" size={48} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Корзина пуста</p>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.price.toLocaleString('ru-RU')} ₽</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                      <Icon name="Minus" size={14} />
                    </Button>
                    <span className="font-semibold">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                      <Icon name="Plus" size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" className="ml-auto" onClick={() => removeFromCart(item.id)}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Итого:</span>
              <span className="text-2xl font-bold text-primary">{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
            </div>
            <Button className="w-full" size="lg">
              Оформить заказ
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderAbout = () => (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">О магазине Техно Комп</h2>
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Icon name="Store" size={32} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Наш магазин</h3>
                <p className="text-muted-foreground">
                  Техно Комп — это современный магазин электроники и техники. Мы предлагаем широкий ассортимент 
                  качественных товаров по доступным ценам.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Icon name="Award" size={32} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Наши преимущества</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Оригинальная продукция с гарантией</li>
                  <li>• Быстрая доставка по всей России</li>
                  <li>• Профессиональная консультация</li>
                  <li>• Программа лояльности для постоянных клиентов</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Icon name="Phone" size={32} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Контакты</h3>
                <p className="text-muted-foreground">
                  Телефон: +7 (800) 555-35-35<br />
                  Email: info@techno-comp.ru<br />
                  Время работы: Пн-Пт 9:00 - 20:00
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Доставка и оплата</h2>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Icon name="Truck" size={32} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Способы доставки</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Курьерская доставка</p>
                    <p>По Москве и МО — от 300 ₽. Доставка в день заказа при оформлении до 12:00</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Пункты выдачи</p>
                    <p>Более 5000 пунктов по всей России — от 200 ₽. Срок доставки 2-5 дней</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Почта России</p>
                    <p>Доставка в любую точку страны — от 350 ₽. Срок доставки 5-14 дней</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Icon name="CreditCard" size={32} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Способы оплаты</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Банковские карты (Visa, Mastercard, МИР)</li>
                  <li>• Электронные кошельки (ЮMoney, QIWI)</li>
                  <li>• Наличные при получении</li>
                  <li>• Безналичный расчет для юридических лиц</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Icon name="Gift" size={32} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Бесплатная доставка</h3>
                <p className="text-muted-foreground">
                  При заказе от 5000 ₽ доставка по Москве бесплатно! При заказе от 10000 ₽ — бесплатная 
                  доставка по всей России.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return renderHome();
      case 'catalog':
        return renderCatalog();
      case 'about':
        return renderAbout();
      case 'delivery':
        return renderDelivery();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderNavigation()}
      <main>{renderContent()}</main>
      <footer className="bg-secondary mt-12 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Техно Комп. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
