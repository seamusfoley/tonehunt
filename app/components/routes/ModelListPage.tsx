import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import { find } from "lodash";
import { stringify as qs_stringify } from "qs";

import type { SelectOption } from "~/components/ui/Select";
import ModelsListComponent from "~/components/ModelList";
import Loading from "~/components/ui/Loading";
import type { Counts } from "@prisma/client";
import { getCategoryProfile } from "~/services/categories";
import { twMerge } from "tailwind-merge";
import { sortCategories } from "~/utils/categories";
import { formatNumber } from "~/utils/number";

// THE AMOUNT OF MODELS PER PAGE
export const MODELS_LIMIT = 20;

type ModelListPageProps = {
  counts: Counts[];
};

export default function ModelListPage({ counts }: ModelListPageProps) {
  const data = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const modelList = data.modelList;

  const filterOptions = [{ id: 0, title: "All", slug: "all" }, ...sortCategories(modelList.categories)];
  const findFilter = find(filterOptions, ["slug", modelList.filter]);

  const defaultFilter = findFilter
    ? { value: String(findFilter.id), description: findFilter.title }
    : { value: "0", description: "All" };

  const selectOptions: SelectOption[] = filterOptions.map((option) => ({
    value: String(option.id),
    description: option.title,
  }));
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter.value);

  const handlePageClick = (selectedPage: number) => {
    setLoading(true);
    searchParams.set("page", String(selectedPage + 1));
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (modelList) {
      setLoading(false);
    }
  }, [modelList, searchParams]);

  if (!modelList) {
    return <></>;
  }

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFilter = event.target.value;
    setSelectedFilter(selectedFilter);

    const findFilter = find(filterOptions, ["id", Number(selectedFilter)]);

    const params: any = {
      page: 1,
      filter: findFilter.slug,
      sortBy: modelList.sortBy,
      sortDirection: modelList.sortDirection,
    };

    if (data.username) {
      params.username = data.username;
    }

    if (data.tags) {
      params.tags = data.tags;
    }

    const query = qs_stringify(params);
    window.location.href = `/?${query}`;
  };

  const onSortChange = (sortBy: string) => {
    const params: any = {
      page: 1,
      filter: findFilter.slug,
      sortBy: sortBy,
      sortDirection: modelList.sortDirection,
    };

    if (data.username) {
      params.username = data.username;
    }

    if (data.tags) {
      params.tags = data.tags;
    }

    const query = qs_stringify(params);
    window.location.href = `/?${query}`;
  };
  const renderTitle = () => {
    // TODO: Need to acount for filters on tags, and other comibindations

    if (searchParams.get("tags")) {
      return <ModelListTitle>#{searchParams.get("tags")}</ModelListTitle>;
    }

    const filter = searchParams.get("filter");
    if (filter && filter !== "all") {
      const category = modelList.categories.find((c) => c.slug === filter);

      if (!category) {
        return <></>;
      }

      return (
        <ModelListTitle>
          <div className="flex items-center gap-5">{category.title}s</div>
        </ModelListTitle>
      );
    }

    return <ModelListCountTitle counts={counts} />;
  };

  // WE ARE MAKING MODEL LIST THE DEFAULT FOR NOW
  return (
    <div className="w-full">
      {renderTitle()}
      <div className="flex">
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center px-10 py-60">
              <Loading size="48" />
            </div>
          ) : null}
          {!loading ? (
            <ModelsListComponent
              data={modelList.models}
              total={modelList.total}
              currentPage={modelList.page}
              limit={MODELS_LIMIT}
              handlePageClick={handlePageClick}
              filterOptions={selectOptions}
              selectedFilter={selectedFilter}
              setSelectedFilter={handleFilterChange}
              selectedSortBy={modelList.sortBy}
              onSortChange={onSortChange}
              user={data.user}
              profile={data.profile}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const ModelListTitle = ({ children, className }: PropsWithChildren & { className?: string }) => {
  return (
    <h1
      className={twMerge(
        "w-full text-2xl lg:text-[57px] lg:leading-[110%] font-satoshi-bold mb-10 lg:mb-20",
        className
      )}
    >
      {children}
    </h1>
  );
};

export const ModelListCountTitle = ({ counts, className }: { className?: string; counts: Counts[] }) => {
  const total = counts.reduce((total, count) => {
    return total + count.count;
  }, 0);

  return (
    <ModelListTitle className={className}>
      Explore over {formatNumber(total)} models, including{" "}
      <Link prefetch="intent" to="/?filter=amp" className="border-tonehunt-green border-b-8 hover:text-tonehunt-green">
        {formatNumber(counts.find((count) => count.name === "amps")?.count ?? 0)}
      </Link>{" "}
      amps, and{" "}
      <Link
        prefetch="intent"
        to="/?filter=pedal"
        className="border-tonehunt-yellow border-b-8 hover:text-tonehunt-yellow"
      >
        {formatNumber(counts.find((count) => count.name === "pedals")?.count ?? 0)}
      </Link>{" "}
      pedals.
    </ModelListTitle>
  );
};
