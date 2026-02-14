import { useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Search } from "lucide-react";

const TagNotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Tag className="w-16 h-16 text-muted-foreground" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Tag Page Coming Soon
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tag-based filtering is currently under development. For now, you can explore articles through our categories and series.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="hover:shadow-soft transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                onClick={() => navigate("/categories")}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Categories
              </Button>
              
              <Button 
                onClick={() => navigate("/articles")}
                variant="outline"
                className="hover:shadow-soft transition-all duration-300"
              >
                View All Articles
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
    </div>
  );
};

export default TagNotFoundPage;
